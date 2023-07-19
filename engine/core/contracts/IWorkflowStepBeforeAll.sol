// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// @title The interface between WorkflowRunner and each Step implementation when the step needs
/// to do something before the steps in the workflow execute.
/// @author Marty Saxton
/// @notice This interface is optional.
interface IWorkflowStepBeforeAll {
  /// @notice called by WorkflowRunner to execute some logic before the workflow starts.
  /// @param argData Step specific arguments in ABI encoding
  function beforeAll(bytes calldata argData) external payable;
}
