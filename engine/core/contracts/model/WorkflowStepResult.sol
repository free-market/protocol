// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './AssetAmount.sol';

// The return value from the execution of a step.
struct WorkflowStepResult {
  // The amounts of each input asset that resulted from the step execution.
  AssetAmount[] inputAssetAmounts;
  // The amounts of each output asset that resulted from the step execution.
  AssetAmount[] outputAssetAmounts;
  // The amounts of each output asset that resulted from the step execution.
  AssetAmount[] outputAssetAmountsToCaller;
  // The index of the next step in a workflow.
  // This value allows the step to override the default nextStepIndex
  // statically defined
  // -1 means terminate the workflow
  // -2 means do not override the statically defined nextStepIndex in WorkflowStep
  int16 nextStepIndex;
  // the fee to be withheald out of the output assets (in decibips)
  // -1 means use the default fee
  int24 fee;
}
