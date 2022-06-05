// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

interface IUserManager {
  function createUserProxy() external;

  function getUserProxy() external view returns (address);
}
