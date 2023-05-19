// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/model/AssetType.sol';
import '@freemarket/core/contracts/model/WorkflowStepResult.sol';

library LibActionHelpers {
  function singleAssetResult(AssetType assetType, address assetAddress, uint256 amount) internal pure returns (WorkflowStepResult memory) {
    Asset memory asset = Asset(assetType, assetAddress);
    AssetAmount[] memory ouputAssetAmounts = new AssetAmount[](1);
    ouputAssetAmounts[0] = AssetAmount(asset, amount);
    return WorkflowStepResult(new AssetAmount[](0), ouputAssetAmounts, -2, -1);
  }

  function singleTokenResult(address assetAddress, uint256 amount) internal pure returns (WorkflowStepResult memory) {
    return singleAssetResult(AssetType.ERC20, assetAddress, amount);
  }

  function noOutputAssetsResult() internal pure returns (WorkflowStepResult memory) {
    return singleAssetResult(AssetType.Native, address(0), 0);
  }
}
