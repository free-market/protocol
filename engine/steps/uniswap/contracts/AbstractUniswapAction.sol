// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@freemarket/step-sdk/contracts/ABDKMathQuad.sol';
import './IV3SwapRouter.sol';

using ABDKMathQuad for bytes16;

struct UniswapRoute {
  bytes encodedPath;
  int256 portion; // like percent but already divided by 100
  // uint256 minExchangeRate;
}

abstract contract AbstractUniswapAction {
  address public immutable routerAddress;
  address public immutable wethAddress;

  constructor(address _routerAddress, address _wethAddress) {
    routerAddress = _routerAddress;
    wethAddress = _wethAddress;
  }

  function runRoute(uint256 amountRemaining, UniswapRoute[] memory routes, address inputAssetAddress, address outputAssetAddress) internal {
    IERC20 inputAsset = IERC20(inputAssetAddress);
    IERC20 outputAsset = IERC20(outputAssetAddress);
    bytes16 fTotalAmount = ABDKMathQuad.fromUInt(amountRemaining);
    for (uint256 i = 0; i < routes.length; ++i) {
      console.log('route', i);
      console.log('  input balance  ', inputAsset.balanceOf(address(this)));
      console.log('  output balance ', outputAsset.balanceOf(address(this)));
      UniswapRoute memory route = routes[i];
      bytes16 portion = ABDKMathQuad.from128x128(route.portion);
      uint256 amount;
      // if this is the last route, use the remaining amount to avoid rounding errors
      if (i < routes.length - 1) {
        amount = portion.mul(fTotalAmount).toUInt();
        console.log('  amount computed from portion', amount);
      } else {
        amount = amountRemaining;
        console.log('  amount computed from remaining', amount);
      }
      callUniswap(route.encodedPath, amount);
      amountRemaining -= amount;
    }
  }

  function callUniswap(bytes memory encodedPath, uint256 amount) internal virtual;

  // there are just here for unit testing to enable weth.withdraw()
  receive() external payable {}

  fallback() external payable {}
}
