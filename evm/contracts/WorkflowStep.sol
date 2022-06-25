// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

struct WorkflowStep {
  uint16 stepId;
  uint160 fromToken;
  uint256 amount;
  bool amountIsPercent;
  uint256[] args;
}
