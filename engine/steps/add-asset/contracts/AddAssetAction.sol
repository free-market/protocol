// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@freemarket/core/contracts/LibPercent.sol';
import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/core/contracts/model/Asset.sol';
import '@freemarket/core/contracts/model/AssetAmount.sol';
import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';

// import 'hardhat/console.sol';

using LibStepResultBuilder for StepResultBuilder;
using SafeERC20 for IERC20;

contract AddAssetAction is IWorkflowStep {
  /// @notice This event is emitted when AddAssetAction is executed
  /// @param assetAmount The asset and amount that is transferred into this workflow instance
  event AssetAdded(AssetAmount assetAmount);

  function execute(AssetAmount[] calldata assetAmounts, bytes calldata) external payable returns (WorkflowStepResult memory) {
    // validate
    require(assetAmounts.length == 1, 'AddTokenAction must have 1 AssetAmount');

    // console.log('addAsset', assetAmounts[0].amount);

    emit AssetAdded(assetAmounts[0]);

    if (assetAmounts[0].asset.assetType == AssetType.Native) {
      require(msg.value == assetAmounts[0].amount, 'native amount should match msg.value');
      // returning 0 inputs 0 outputs because this is really a no-op
      // native coming in is already accounted for
      return LibStepResultBuilder.create(0, 0).result;
    }

    require(assetAmounts[0].asset.assetType == AssetType.ERC20, 'AddTokenAction supports native and ERC20s');

    // transfer the token to this
    IERC20 erc20 = IERC20(assetAmounts[0].asset.assetAddress);
    erc20.safeTransferFrom(msg.sender, address(this), assetAmounts[0].amount);

    // WorkflowStepResult memory asdf = LibStepResultBuilder.create(0, 1).addOutputToken(
    //     assetAmounts[0].asset.assetAddress, assetAmounts[0].amount
    // ).result;

    // console.log('result', asdf.outputAssetAmounts.length);
    // console.log('result1', assetAmounts[0].asset.assetAddress);
    // console.log('result11', assetAmounts[0].amount);
    // console.log('result2', asdf.outputAssetAmounts[0].amount);

    // return amount transferred
    return LibStepResultBuilder.create(0, 1).addOutputToken(assetAmounts[0].asset.assetAddress, assetAmounts[0].amount).result;
  }
}
