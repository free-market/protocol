// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Parameters for a workflow step
struct WorkflowStep {
  uint16 actionId;
  uint256 fromAsset;
  uint256 amount;
  bool amountIsPercent;
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
