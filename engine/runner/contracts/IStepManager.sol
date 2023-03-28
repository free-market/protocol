// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./StepInfo.sol";

interface IStepManager {
    /// @dev Associate a new address with a stepTypeId
    function setStepAddress(uint16 stepTypeId, address stepAddress) external; // onlyOwner

    /// @dev Retrieve the address associated with a stepTypeId
    function getStepAddress(uint16 stepTypeId) external view returns (address);

    /// @dev getStepCount getStepInfoAt together allow enumeration of all steps
    function getStepCount() external view returns (uint256);

    function getStepInfoAt(uint256 index) external view returns (StepInfo memory);
}
