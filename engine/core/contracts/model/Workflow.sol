// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./WorkflowStep.sol";

// The main workflow data structure.
struct Workflow {
    // The nodes in the directed graph of steps.
    // The start step is defined to be at index 0.
    // The 'edges' in the graph are defined within each WorkflowStep,
    // but can be overriden in the return value of a step.
    WorkflowStep[] steps;
}
