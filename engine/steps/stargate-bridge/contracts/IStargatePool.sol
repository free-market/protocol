// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.13;

interface IStargatePool {
  function token() external view returns (address);

  function feeLibrary() external view returns (address);
}
