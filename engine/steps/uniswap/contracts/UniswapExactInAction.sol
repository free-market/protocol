// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/step-sdk/contracts/IWeth.sol';
import '@freemarket/core/contracts/model/AssetAmount.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import 'hardhat/console.sol';

import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import '@freemarket/step-sdk/contracts/LibErc20.sol';
import '@freemarket/step-sdk/contracts/LibWethUtils.sol';
import './AbstractUniswapAction.sol';
import '@freemarket/step-sdk/contracts/ABDKMathQuad.sol';
using ABDKMathQuad for bytes16;

using LibStepResultBuilder for StepResultBuilder;
using LibErc20 for IERC20;

struct UniswapExactInActionParams {
  Asset toAsset;
  UniswapRoute[] routes;
  int256 worstExchangeRate;
}

contract UniswapExactInAction is AbstractUniswapAction, IWorkflowStep {
  event UniswapExactInActionEvent(address from, address to, uint256 amount, bool useNative);

  constructor(address _routerAddress, address _wethAddress) AbstractUniswapAction(_routerAddress, _wethAddress) {}

  struct Locals {
    UniswapExactInActionParams args;
    bytes16 worstExchangeRateFloat;
    address inputTokenAddress;
    IERC20 inputAsset;
    address outputTokenAddress;
    IERC20 outputAsset;
    uint256 amountIn;
    bytes16 amountInFloat;
    uint256 outputAssetBalanceBefore;
    uint256 outputAssetBalanceAfter;
    uint256 amountReceived;
    uint256 worstTolerableAmountReceived;
  }

  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    bytes calldata argData,
    address
  ) public payable returns (WorkflowStepResult memory) {
    console.log('entering uniswap exact in action');

    // validate
    require(inputAssetAmounts.length == 1, 'there must be exactly 1 input asset');

    Locals memory locals;

    locals.args = abi.decode(argData, (UniswapExactInActionParams));
    locals.worstExchangeRateFloat = ABDKMathQuad.from128x128(locals.args.worstExchangeRate);
    console.log('decoded');

    if (
      inputAssetAmounts[0].asset.assetAddress == locals.args.toAsset.assetAddress &&
      inputAssetAmounts[0].asset.assetType == locals.args.toAsset.assetType
    ) {
      // swapping to same asset, no-op
      return
        LibStepResultBuilder
          .create(1, 1)
          .addInputAssetAmount(inputAssetAmounts[0])
          .addOutputAssetAmount(AssetAmount(locals.args.toAsset, inputAssetAmounts[0].amount))
          .result;
    }

    locals.inputTokenAddress = LibWethUtils.wrapIfNecessary(inputAssetAmounts[0], wethAddress);

    locals.inputAsset = IERC20(locals.inputTokenAddress);
    console.log('approving input asset');
    console.log('routerAddress', routerAddress);
    console.log('locals.inputTokenAddress', locals.inputTokenAddress);
    console.log('inputAssetAmounts[0].amount', inputAssetAmounts[0].amount);
    locals.inputAsset.safeApprove(routerAddress, inputAssetAmounts[0].amount);
    console.log('approved input asset');

    // logArgs(args);

    locals.outputTokenAddress = locals.args.toAsset.assetAddress;
    if (locals.args.toAsset.assetType == AssetType.Native) {
      locals.outputTokenAddress = wethAddress;
    }

    IERC20 outputAsset = IERC20(locals.outputTokenAddress);
    locals.outputAssetBalanceBefore = outputAsset.balanceOf(address(this));

    locals.amountIn = inputAssetAmounts[0].amount;
    locals.amountInFloat = ABDKMathQuad.fromUInt(inputAssetAmounts[0].amount);

    runRoute(locals.amountIn, locals.args.routes, locals.inputTokenAddress, locals.outputTokenAddress);

    // for (uint256 i = 0; i < locals.args.routes.length; i++) {
    //   console.log('route', i);
    //   console.log('  input balance  ', locals.inputAsset.balanceOf(address(this)));
    //   console.log('  output balance ', outputAsset.balanceOf(address(this)));

    //   UniswapRoute memory route = locals.args.routes[i];
    //   bytes16 portion = ABDKMathQuad.from128x128(route.portion);
    //   uint256 amount;
    //   // if this is the last route, use the remaining amount to avoid rounding errors
    //   if (i < locals.args.routes.length - 1) {
    //     amount = portion.mul(locals.amountInFloat).toUInt();
    //     console.log('  amount computed from portion', amount);
    //   } else {
    //     amount = locals.amountRemaining;
    //     console.log('  amount computed from remaining', amount);
    //   }
    //   // minAmoutOut is zero because we're doing it ourself after all routes have been executed
    //   console.log('calling uniswap for amount', amount);
    //   IV3SwapRouter.ExactInputParams memory routerArgs = IV3SwapRouter.ExactInputParams(route.encodedPath, address(this), amount, 0);
    //   IV3SwapRouter(routerAddress).exactInput(routerArgs);
    //   locals.amountRemaining -= amount;
    // }

    // check the amount received vs minExchangeRate
    locals.outputAssetBalanceAfter = outputAsset.balanceOf(address(this));
    console.log('this address', address(this));
    console.log('outputAsset address', address(outputAsset));
    console.log('outputAssetBalanceAfter', locals.outputAssetBalanceAfter);
    locals.amountReceived = locals.outputAssetBalanceAfter - locals.outputAssetBalanceBefore;
    locals.worstTolerableAmountReceived = locals.amountInFloat.mul(locals.worstExchangeRateFloat).toUInt();
    console.log('worstTolerableAmountReceived', locals.worstTolerableAmountReceived);
    if (locals.amountReceived < locals.worstTolerableAmountReceived) {
      string memory message = string(
        abi.encodePacked(
          'amount received is worse than worst tolerable amount: ',
          Strings.toString(locals.amountReceived),
          ' < ',
          Strings.toString(locals.worstTolerableAmountReceived)
        )
      );
      revert(message);
    }
    // require(locals.amountReceived >= locals.worstTolerableAmountReceived, 'amount received is worse than worst tolerable amount received');

    // unwrap native if necessary
    if (locals.args.toAsset.assetType == AssetType.Native) {
      IWeth(wethAddress).withdraw(locals.amountReceived);
    }

    return
      LibStepResultBuilder
        .create(1, 1)
        .addInputAssetAmount(inputAssetAmounts[0])
        .addOutputAssetAmount(AssetAmount(locals.args.toAsset, locals.amountReceived))
        .result;
  }

  function logArgs(UniswapExactInActionParams memory args) internal pure {
    console.log('toAsset address', args.toAsset.assetAddress);
    // console.log('minExchangeRate', args.worstExchangeRate);
    for (uint256 i = 0; i < args.routes.length; i++) {
      console.log('  route', i);
      // console.log("  encodedPath", args.routes[i].encodedPath);
      console.log('  portion', uint256(args.routes[i].portion));
    }
  }

  function callUniswap(bytes memory encodedPath, uint256 amount) internal override {
    console.log('calling uniswap exact in for amount', amount);
    IV3SwapRouter.ExactInputParams memory routerArgs = IV3SwapRouter.ExactInputParams(encodedPath, address(this), amount, 0);
    IV3SwapRouter(routerAddress).exactInput(routerArgs);
  }
}
