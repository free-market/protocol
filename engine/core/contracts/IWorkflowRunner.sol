// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './model/AssetAmount.sol';
import './model/Workflow.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

/// @notice An interface defining the entry point to the engine for executing workflows.
interface IWorkflowRunner {
  /// @notice Initiate the execution of a workflow.
  /// @param workflow The workflow to execute.
  function executeWorkflow(Workflow calldata workflow) external payable;

  /// @notice Continue a workflow that started on a different chain.
  /// @notice This is not callable by 3rd parties, only approved bridge integrations call this method.
  function continueWorkflow(
    address userAddress,
    uint256 nonce,
    Workflow memory workflow,
    AssetAmount[] memory startingAssets
  ) external payable;
}
