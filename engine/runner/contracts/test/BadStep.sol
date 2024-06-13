// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/core/contracts/model/WorkflowStepResult.sol';
import 'hardhat/console.sol';

contract BadStep is IWorkflowStep {
  address public eternalStorageAddress;
  address public upstreamAddress;
  bool public isUserProxy;
  address public owner;

  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    bytes calldata argData,
    address userAddress
  ) external payable override returns (WorkflowStepResult memory) {
    uint160 i = 0;
    eternalStorageAddress = address(++i);
    upstreamAddress = address(++i);
    isUserProxy != isUserProxy;
    owner = address(++i);
    console.log('Running BadStep');
    /*
      AssetAmount[] inputAssetAmounts;
  // The amounts of each output asset that resulted from the step execution.
  AssetAmount[] outputAssetAmounts;
  // The amounts of each output asset that resulted from the step execution.
  AssetAmount[] outputAssetAmountsToCaller;
  // The index of the next step in a workflow.
  // This value allows the step to override the default nextStepIndex
  // statically defined
  // -1 means terminate the workflow
  // -2 means do not override the statically defined nextStepIndex in WorkflowStep
  int16 nextStepIndex;
  // the fee to be withheald out of the output assets (in absolute currency units)
  // -1 means use the default fee
  int24 fee;
  */
    WorkflowStepResult memory rslt = WorkflowStepResult({
        inputAssetAmounts: inputAssetAmounts,
        outputAssetAmounts: inputAssetAmounts,
        outputAssetAmountsToCaller: new AssetAmount[](0),
        nextStepIndex: -1,
        fee: -1   
        
    });
    return rslt;
  }
}
