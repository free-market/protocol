// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/step-sdk/contracts/LibActionHelpers.sol';
import '@freemarket/step-sdk/contracts/IWeth.sol';
import '@freemarket/core/contracts/model/AssetAmount.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import 'hardhat/console.sol';

import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import '@freemarket/step-sdk/contracts/LibErc20.sol';
import '@freemarket/step-sdk/contracts/ABDKMathQuad.sol';
import '@freemarket/step-sdk/contracts/LibWethUtils.sol';
import './IV3SwapRouter.sol';

using ABDKMathQuad for bytes16;
using LibStepResultBuilder for StepResultBuilder;
using LibErc20 for IERC20;

struct UniswapRoute {
  bytes encodedPath;
  int256 portion; // like percent but already divided by 100
  // uint256 minExchangeRate;
}

struct UniswapExactInActionParams {
  Asset toAsset;
  UniswapRoute[] routes;
  int256 minExchangeRate;
}

contract UniswapExactInAction is IWorkflowStep {
  event UniswapExactInActionEvent(address from, address to, uint256 amount, bool useNative);

  address public immutable routerAddress;
  address public immutable wethAddress;

  constructor(address _routerAddress, address _wethAddress) {
    routerAddress = _routerAddress;
    wethAddress = _wethAddress;
  }

  struct Locals {
    UniswapExactInActionParams args;
    address inputTokenAddress;
    IERC20 inputAsset;
    address outputTokenAddress;
    IERC20 outputAsset;
    uint256 amountRemaining;
    bytes16 amountInFloat;
    uint256 outputAssetBalanceBefore;
    uint256 outputAssetBalanceAfter;
    uint256 amountReceived;
  }

  function execute(AssetAmount[] calldata inputAssetAmounts, bytes calldata argData) public payable returns (WorkflowStepResult memory) {
    console.log('entering uniswap exact in action');
    // validate
    require(inputAssetAmounts.length == 1, 'there must be exactly 1 input asset');

    Locals memory locals;

    locals.args = abi.decode(argData, (UniswapExactInActionParams));
    console.log('decoded');
    // same from/to fails in the uniswap sdk
    // // check for no-op
    // if (
    //   inputAssetAmounts[0].asset.assetAddress == locals.args.toAsset.assetAddress &&
    //   inputAssetAmounts[0].asset.assetType == locals.args.toAsset.assetType
    // ) {
    //   return
    //     LibStepResultBuilder
    //       .create(1, 1)
    //       .addInputAssetAmount(inputAssetAmounts[0])
    //       .addOutputAssetAmount(AssetAmount(locals.args.toAsset, inputAssetAmounts[0].amount))
    //       .result;
    // }

    // if (inputAssetAmounts[0].asset.assetType == AssetType.Native || locals.args.toAsset.assetType == AssetType.Native) {
    //   console.log('wethAddress', wethAddress);
    //   require(wethAddress != address(0), 'weth not supported on this chain');
    // }

    locals.inputTokenAddress = LibWethUtils.wrapIfNecessary(inputAssetAmounts[0], wethAddress);

    // wrap native if necessary
    // if (inputAssetAmounts[0].asset.assetType == AssetType.Native) {
    //   console.log('wrapping native', inputAssetAmounts[0].amount);
    //   console.log('this', address(this));
    //   console.log('my balance', address(this).balance);
    //   IWeth(wethAddress).deposit{value: inputAssetAmounts[0].amount}();

    //   console.log('wrapped native');
    //   locals.inputTokenAddress = wethAddress;
    // } else {
    //   locals.inputTokenAddress = inputAssetAmounts[0].asset.assetAddress;
    //   console.log('not wrapping, asset address:', locals.inputTokenAddress);
    //   uint256 myBalanceOfToken = IERC20(locals.inputTokenAddress).balanceOf(address(this));
    //   console.log('my balance of token', myBalanceOfToken);
    // }

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

    locals.amountRemaining = inputAssetAmounts[0].amount;
    locals.amountInFloat = ABDKMathQuad.fromUInt(inputAssetAmounts[0].amount);

    for (uint256 i = 0; i < locals.args.routes.length; i++) {
      console.log('route', i);
      console.log('  input balance  ', locals.inputAsset.balanceOf(address(this)));
      console.log('  output balance ', outputAsset.balanceOf(address(this)));

      UniswapRoute memory route = locals.args.routes[i];
      bytes16 portion = ABDKMathQuad.from128x128(route.portion);
      uint256 amount;
      // if this is the last route, use the remaining amount to avoid rounding errors
      if (i < locals.args.routes.length - 1) {
        amount = portion.mul(locals.amountInFloat).toUInt();
        console.log('  amount computed from portion', amount);
      } else {
        amount = locals.amountRemaining;
        console.log('  amount computed from remaining', amount);
      }
      // minAmoutOut is zero because we're doing it ourself after all routes have been executed
      console.log('calling uniswap for amount', amount);
      IV3SwapRouter.ExactInputParams memory routerArgs = IV3SwapRouter.ExactInputParams(route.encodedPath, address(this), amount, 0);
      IV3SwapRouter(routerAddress).exactInput(routerArgs);
      locals.amountRemaining -= amount;
    }

    // check the amount received vs minExchangeRate
    locals.outputAssetBalanceAfter = outputAsset.balanceOf(address(this));
    console.log('this address', address(this));
    console.log('outputAsset address', address(outputAsset));
    console.log('outputAssetBalanceAfter', locals.outputAssetBalanceAfter);
    locals.amountReceived = locals.outputAssetBalanceAfter - locals.outputAssetBalanceBefore;

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

  function logArgs(UniswapExactInActionParams memory args) internal view {
    console.log('toAsset address', args.toAsset.assetAddress);
    console.log('minExchangeRate', uint256(args.minExchangeRate));
    for (uint256 i = 0; i < args.routes.length; i++) {
      console.log('  route', i);
      // console.log("  encodedPath", args.routes[i].encodedPath);
      console.log('  portion', uint256(args.routes[i].portion));
    }
  }

  // there are just here for unit testing to enable weth.withdraw()
  receive() external payable {}

  fallback() external payable {}
}
