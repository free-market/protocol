// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import '@freemarket/core/contracts/model/AssetAmount.sol';
import './IWeth.sol';

library LibWethUtils {
  function wrapIfNecessary(AssetAmount memory assetAmount, address wethAddress) internal returns (address) {
    if (assetAmount.asset.assetType == AssetType.Native) {
      require(wethAddress != address(0), 'weth not supported on this chain');
      IWeth(wethAddress).deposit{value: assetAmount.amount}();
      return wethAddress;
    }
    return assetAmount.asset.assetAddress;
  }
}
