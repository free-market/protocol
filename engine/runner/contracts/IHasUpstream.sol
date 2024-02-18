// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IHasUpstream {
  function getUpstream() external view returns (address);
}
