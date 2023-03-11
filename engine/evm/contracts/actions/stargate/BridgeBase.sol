// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '../../IWorkflowStep.sol';

abstract contract BridgeBase is IWorkflowStep {
  event WorkflowBridged(uint256 targetChainId, uint256 nonce);
}
