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
