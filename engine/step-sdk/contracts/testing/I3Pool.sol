// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface I3Pool {
  function coins(uint256 i) external view returns (address);

  function get_dy(int128 i, int128 j, uint256 dx) external view returns (uint256);

  function exchange(int128 i, int128 j, uint256 dx, uint256 min_dy) external;
}
