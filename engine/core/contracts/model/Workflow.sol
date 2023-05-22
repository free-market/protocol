// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './WorkflowStep.sol';

// The main workflow data structure.
struct Workflow {
  // The address of the WorkflowRunner contract, allowing the caller to specify an older version of the runner.
  // If this is the zero address, the most current version of the runner will be used.
  // If a non-zero address is specified, it must be a whitelisted address of a previous WorkflowRunner contract.
  address workflowRunnerAddress;
  // The nodes in the directed graph of steps.
  // The start step is defined to be at index 0.
  // The 'edges' in the graph are defined within each WorkflowStep,
  // but can be overriden in the return value of a step.
  WorkflowStep[] steps;
}
