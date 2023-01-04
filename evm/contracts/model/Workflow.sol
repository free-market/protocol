// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './Asset.sol';

struct WorkflowStepInputAsset {
  Asset asset;
  uint256 amount;
  bool amountIsPercent;
}

// Parameters for a workflow step
struct WorkflowStep {
  uint16 actionId;
  address actionAddress;
  WorkflowStepInputAsset[] inputAssets;
  Asset[] outputAssets;
  uint256[] args;
  uint16 nextStepIndex;
}

struct WorkflowParameter {
  uint256 key;
  uint256 value;
}

struct Workflow {
  WorkflowStep[] steps;
}
