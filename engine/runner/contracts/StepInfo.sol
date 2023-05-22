// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

struct StepInfo {
  uint16 stepTypeId;
  uint24 fee;
  address latest;
  address[] whitelist;
  address[] blacklist;
}
