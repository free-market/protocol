// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './Workflow.sol';

struct BridgePayload {
  address userAddress;
  uint256 nonce;
  Workflow workflow;
}
