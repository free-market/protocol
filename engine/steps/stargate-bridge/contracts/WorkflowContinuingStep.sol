// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';

abstract contract WorkflowContinuingStep is IWorkflowStep {
  event WorkflowBridged(string stepType, uint16 targetChain, uint256 nonce, AssetAmount[] expectedAssets, bytes continuationWorkflow);
  event ContinuationFailure(string reason);
  event ContinuationFailure(bytes reason);
  event ContinuationFailure(uint reason);
  event ContinuationSuccess();
}
