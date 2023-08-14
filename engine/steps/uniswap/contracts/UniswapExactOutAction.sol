// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/step-sdk/contracts/IWeth.sol';
import '@freemarket/core/contracts/model/AssetAmount.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import 'hardhat/console.sol';

import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import '@freemarket/step-sdk/contracts/LibErc20.sol';
import '@freemarket/step-sdk/contracts/LibWethUtils.sol';
import './AbstractUniswapAction.sol';
import '@freemarket/step-sdk/contracts/ABDKMathQuad.sol';
using ABDKMathQuad for bytes16;

using LibStepResultBuilder for StepResultBuilder;
using LibErc20 for IERC20;

struct UniswapExactOutActionParams {
  Asset fromAsset;
  Asset toAsset;
  uint256 amountOut;
  UniswapRoute[] routes;
  int256 worstExchangeRate;
}

contract UniswapExactOutAction is AbstractUniswapAction, IWorkflowStep {
  event UniswapExactOutActionEvent(address from, address to, uint256 amount, bool useNative);

  constructor(address _routerAddress, address _wethAddress) AbstractUniswapAction(_routerAddress, _wethAddress) {}

  struct Locals {
    UniswapExactOutActionParams args;
    bytes16 worstExchangeRateFloat;
    address inputTokenAddress;
    IERC20 inputAsset;
    address outputTokenAddress;
    IERC20 outputAsset;
    bytes16 amountOutFloat;
    uint256 inputAssetBalanceBefore;
    uint256 inputAssetBalanceAfter;
    uint256 outputAssetBalanceBefore;
    uint256 outputAssetBalanceAfter;
    uint256 amountReceived;
    uint256 amountTaken;
    uint256 worstTolerableAmountTaken;
  }

  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    bytes calldata argData,
    address
  ) public payable returns (WorkflowStepResult memory) {
    console.log('entering uniswap exact out action');

    // validate
    require(inputAssetAmounts.length == 0, "there shoudn't be any input assets");

    Locals memory locals;
    locals.args = abi.decode(argData, (UniswapExactOutActionParams));
    console.log('decoded');

    if (
      locals.args.fromAsset.assetAddress == locals.args.toAsset.assetAddress &&
      locals.args.fromAsset.assetType == locals.args.toAsset.assetType
    ) {
      // swapping to same asset, no-op
      AssetAmount memory assetAmount = AssetAmount(locals.args.fromAsset, locals.args.amountOut);
      return LibStepResultBuilder.create(1, 1).addInputAssetAmount(assetAmount).addOutputAssetAmount(assetAmount).result;
    }

    locals.worstExchangeRateFloat = ABDKMathQuad.from128x128(locals.args.worstExchangeRate);
    locals.amountOutFloat = ABDKMathQuad.fromUInt(locals.args.amountOut);
    console.log('worstExchangeRate encoded', uint256(locals.args.worstExchangeRate));

    // wrap if necessary.  Take note of inital native balance, and then just wrap all of it
    if (locals.args.fromAsset.assetType == AssetType.Native) {
      // input is native
      locals.inputAssetBalanceBefore = address(this).balance;
      require(wethAddress != address(0), 'weth not supported on this chain');
      locals.inputAsset = IERC20(wethAddress);
      IWeth(wethAddress).deposit{value: locals.inputAssetBalanceBefore}();
      locals.inputTokenAddress = wethAddress;
    } else {
      // input is an erc20
      locals.inputTokenAddress = locals.args.fromAsset.assetAddress;
      locals.inputAsset = IERC20(locals.inputTokenAddress);
      locals.inputAssetBalanceBefore = locals.inputAsset.balanceOf(address(this));
    }

    // approve the router to take the input asset
    locals.inputAsset.safeApprove(routerAddress, locals.inputAssetBalanceBefore);

    // set up output asset and record balance
    if (locals.args.toAsset.assetType == AssetType.Native) {
      locals.outputTokenAddress = wethAddress;
    } else {
      locals.outputTokenAddress = locals.args.toAsset.assetAddress;
    }
    locals.outputAsset = IERC20(locals.outputTokenAddress);
    locals.outputAssetBalanceBefore = locals.outputAsset.balanceOf(address(this));

    console.log('inputTokenAddress', locals.inputTokenAddress);
    console.log('outputTokenAddress', locals.outputTokenAddress);
    console.log('inputToken balance', locals.inputAssetBalanceBefore);
    console.log('outputToken balance', locals.outputAssetBalanceBefore);
    console.log('inputToken balance x', locals.inputAsset.balanceOf(address(this)));
    console.log('outputToken balance x', locals.outputAsset.balanceOf(address(this)));

    runRoute(locals.args.amountOut, locals.args.routes, locals.inputTokenAddress, locals.outputTokenAddress);

    // verify amount out is what we asked for
    locals.outputAssetBalanceAfter = locals.outputAsset.balanceOf(address(this));
    locals.amountReceived = locals.outputAssetBalanceAfter - locals.outputAssetBalanceBefore;
    require(locals.amountReceived == locals.args.amountOut, 'amount received did not match amount out');

    // verify amount taken is within slippage tolerance
    locals.inputAssetBalanceAfter = locals.inputAsset.balanceOf(address(this));
    locals.amountTaken = locals.inputAssetBalanceBefore - locals.inputAssetBalanceAfter;
    console.log('amountTaken', locals.amountTaken);
    locals.worstTolerableAmountTaken = locals.amountOutFloat.mul(locals.worstExchangeRateFloat).toUInt();
    console.log('worstTolerableAmountTaken', locals.worstTolerableAmountTaken);
    require(locals.amountTaken < locals.worstTolerableAmountTaken, 'amount taken exceeded worst exchange rate');

    // if we wrapped the input, unwrap whatever native is left, but only out of what was wrapped
    if (locals.args.fromAsset.assetType == AssetType.Native) {
      IWeth(wethAddress).withdraw(locals.inputAssetBalanceBefore - locals.amountTaken);
    }

    // wrap the output if necessary
    if (locals.args.toAsset.assetType == AssetType.Native) {
      IWeth(wethAddress).deposit{value: locals.args.amountOut}();
    }

    return
      LibStepResultBuilder
        .create(1, 1)
        .addInputAssetAmount(AssetAmount(locals.args.fromAsset, locals.amountTaken))
        .addOutputAssetAmount(AssetAmount(locals.args.toAsset, locals.amountReceived))
        .result;
  }

  function callUniswap(bytes memory encodedPath, uint256 amount) internal override {
    console.log('calling uniswap exact out for amount', amount);
    IV3SwapRouter.ExactOutputParams memory routerArgs = IV3SwapRouter.ExactOutputParams(
      encodedPath,
      address(this),
      amount,
      0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    );
    IV3SwapRouter(routerAddress).exactOutput(routerArgs);
  }
}
