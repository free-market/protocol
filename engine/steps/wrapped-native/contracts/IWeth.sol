// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface IWeth {
  function deposit() external payable;

  function withdraw(uint) external;
}
