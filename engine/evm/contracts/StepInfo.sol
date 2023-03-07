// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
struct StepInfo {
  uint16 actionId;
  address latest;
  address[] whitelist;
  address[] blacklist;
}
