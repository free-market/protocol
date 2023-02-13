// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './Workflow.sol';

// The payload passed form the source chain to the destination chains to continue a multi-chain workflow
struct BridgePayload {
  // the end user's address on the destination chain
  address userAddress;
  // a (statistically) unique id to correlate the sending chain's workflow segment with the target chain's workflow segment
  uint256 nonce;
  // the 'continuation' workflow that executes on the target chain
  Workflow workflow;
}
