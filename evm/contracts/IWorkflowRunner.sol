// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './WorkflowStep.sol';

interface IWorkflowRunner {
  function executeWorkflow(WorkflowStep[] calldata steps) external payable;
}
