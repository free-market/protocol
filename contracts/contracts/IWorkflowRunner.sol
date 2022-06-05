// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

interface IWorkflowRunner {
  function executeWorkflow(uint256[] calldata params) external payable;
}
