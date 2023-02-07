// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '../../IWorkflowRunner.sol';
import '../../model/Workflow.sol';
import '../../model/AssetAmount.sol';

contract MockWorkflowRunner is IWorkflowRunner {
  event ContinueWorkflowInvoked(address userAddress, uint256 nonce, Workflow workflow, AssetAmount startingAsset);

  function executeWorkflow(Workflow calldata workflow) external payable {
    // empty
  }

  function continueWorkflow(
    address userAddress,
    uint256 nonce,
    Workflow memory workflow,
    AssetAmount memory startingAsset
  ) external payable {
    emit ContinueWorkflowInvoked(userAddress, nonce, workflow, startingAsset);
  }
}
