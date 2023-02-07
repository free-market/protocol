// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './AssetAmount.sol';

struct WorkflowStepResult {
  AssetAmount[] outputAssetAmounts;
  int16 nextStepIndex;
}
