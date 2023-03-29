// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./model/Asset.sol";
import "./model/AssetAmount.sol";
import "./model/WorkflowStepResult.sol";

/// @title The interface between WorkflowRunner and each Step implementation.abi
/// @author Marty Saxton
/// @notice All steps must implement this interface.
interface IWorkflowStep {
    /// @notice called by WorkflowRunner to execute a workflow step.
    /// @param assetAmounts AssetAmounts to be used by the step
    /// @param argData Step specific arguments in ABI encoding
    /// @return the outcome of the step invocation
    function execute(AssetAmount[] calldata assetAmounts, bytes calldata argData)
        external
        payable
        returns (WorkflowStepResult memory);
}
