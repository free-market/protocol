// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@pendle/core-v2/contracts/interfaces/IPAllActionV3.sol';
import '@pendle/core-v2/contracts/interfaces/IPRouterStatic.sol';
import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import '@pendle/core-v2/contracts/interfaces/IPMarket.sol';

abstract contract AbstractPendleAction {
  using LibStepResultBuilder for StepResultBuilder;

  struct PendleSwapTokenParams {
    address market;
    address baseToken;
    uint minTokenOutput;
  }

  IPAllActionV3 public immutable router;
  IPRouterStatic public immutable routerStatic;

  constructor(address _router, address _routerStatic) {
    router = IPAllActionV3(_router);
    routerStatic = IPRouterStatic(_routerStatic);
  }

  /* 
  from https://github.com/pendle-finance/pendle-examples-public/blob/main/test/RouterSample.sol
  cant declare structs constant or immutable
  */
  function defaultApprox() public pure returns (ApproxParams memory) {
    return ApproxParams(0, type(uint256).max, 0, 256, 1e14);
  }
  /*
  // EmptySwap means no swap aggregator is involved
  function emptySwap() public pure returns (SwapData memory) {
    SwapData memory swapData;
    return swapData;
  }
  */
  // EmptyLimit means no limit order is involved
  function emptyLimit() public pure returns (LimitOrderData memory) {
    LimitOrderData memory limit;
    return limit;
  }
  


  /// @notice create a simple TokenInput struct without using any aggregators. For more info please refer to
  /// IPAllActionTypeV3.sol
  function createTokenInputStruct(address tokenIn, uint256 netTokenIn) internal view returns (TokenInput memory) {
    SwapData memory emptySwap;
    return TokenInput({tokenIn: tokenIn, netTokenIn: netTokenIn, tokenMintSy: tokenIn, pendleSwap: address(0), swapData: emptySwap});
  }

  /// @notice create a simple TokenOutput struct without using any aggregators. For more info please refer to
  /// IPAllActionTypeV3.sol
  function createTokenOutputStruct(address tokenOut, uint256 minTokenOut) internal view returns (TokenOutput memory) {
    SwapData memory emptySwap;
    return
      TokenOutput({tokenOut: tokenOut, minTokenOut: minTokenOut, tokenRedeemSy: tokenOut, pendleSwap: address(0), swapData: emptySwap});
  }
}
