// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Asset.sol";

// an input asset to a WorkflowStep
struct WorkflowStepInputAsset {
    // the input asset
    Asset asset;
    // the amount of the input asset
    uint256 amount;
    // if true 'amount' is treated as a percent, with 4 decimals of precision (1000000 represents 100%)
    bool amountIsPercent;
}
