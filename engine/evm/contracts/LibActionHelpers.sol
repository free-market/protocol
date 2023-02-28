// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './model/AssetType.sol';
import './model/WorkflowStepResult.sol';

library LibActionHelpers {
  function singleAssetResult(
    AssetType assetType,
    address assetAddress,
    uint256 amount
  ) internal pure returns (WorkflowStepResult memory) {
    Asset memory wethAsset = Asset(assetType, assetAddress);
    AssetAmount[] memory ouputAssetAmounts = new AssetAmount[](1);
    ouputAssetAmounts[0] = AssetAmount(wethAsset, amount);
    return WorkflowStepResult(ouputAssetAmounts, -1);
  }

  function singleTokenResult(address assetAddress, uint256 amount) internal pure returns (WorkflowStepResult memory) {
    return singleAssetResult(AssetType.ERC20, assetAddress, amount);
  }

  function noOutputAssetsResult() internal pure returns (WorkflowStepResult memory) {
    return singleAssetResult(AssetType.Native, address(0), 0);
  }
}
