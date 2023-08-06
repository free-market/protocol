// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

struct StepInfo {
  uint16 stepTypeId;
  bool feeIsPercent;
  uint256 fee;
  address latest;
  address[] whitelist;
  address[] blacklist;
}
