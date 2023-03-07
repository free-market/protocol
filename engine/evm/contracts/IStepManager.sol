// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './StepInfo.sol';

interface IStepManager {
  /// @dev Associate a new address with a stepId
  function setStepAddress(uint16 stepId, address stepAddress) external; // onlyOwner

  /// @dev Retrieve the address associated with a stepId
  function getStepAddress(uint16 stepId) external view returns (address);

  /// @dev getStepCount getStepInfoAt together allow enumeration of all steps
  function getStepCount() external view returns (uint256);

  function getStepInfoAt(uint256 index) external view returns (StepInfo memory);
}
