// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './LibAsset.sol';

struct WorkflowStepResult {
  LibAsset.Asset outputAsset;
  uint256 ouputAmount;
}

interface IWorkflowStep {
  function execute(
    uint256 inputAsset,
    uint256 amount,
    uint256[] calldata args
  ) external returns (WorkflowStepResult memory);
}
