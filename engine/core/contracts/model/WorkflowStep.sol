// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./WorkflowStepInputAsset.sol";

// Parameters for a workflow step
struct WorkflowStep {
    // The logical identifer of the step (e.g., 10 represents WrapEtherStep).
    uint16 stepTypeId;
    // The contract address of a specific version of the action.
    // Individual step contracts may be upgraded over time, and this allows
    // workflows 'freeze' the version of contract for this step
    // A value of address(0) means use the latest and greatest version  of
    // this step based only on stepTypeId.
    address stepAddress;
    // The input assets to this step.
    WorkflowStepInputAsset[] inputAssets;
    // Additional step-specific parameters for this step, typically serialized in standard abi encoding.
    bytes argData;
    // The index of the next step in the directed graph of steps. (see the Workflow.steps array)
    int16 nextStepIndex;
}
