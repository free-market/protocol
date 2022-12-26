// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './Workflow.sol';

interface IWorkflowRunner {
  function executeWorkflow(Workflow calldata workflow, WorkflowParameter[] calldata params) external payable;
}
