// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@freemarket/core/contracts/model/AssetAmount.sol";
import "@freemarket/core/contracts/model/Workflow.sol";

interface IWorkflowRunner {
    function executeWorkflow(Workflow calldata workflow) external payable;

    function continueWorkflow(
        address userAddress,
        uint256 nonce,
        Workflow memory workflow,
        AssetAmount memory startingAsset
    ) external payable;
}
