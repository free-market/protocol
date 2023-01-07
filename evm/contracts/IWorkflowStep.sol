// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './model/Asset.sol';
import './model/AssetAmount.sol';
import './model/WorkflowStepResult.sol';

interface IWorkflowStep {
  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    Asset[] calldata outputAssets,
    bytes calldata args
  ) external payable returns (WorkflowStepResult memory);
}
