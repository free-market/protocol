// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import './Weth.sol';
import 'hardhat/console.sol';

using LibStepResultBuilder for StepResultBuilder;

contract WrapNativeAction is IWorkflowStep {
  address public immutable contractAddress;

  event NativeWrapped(address thisAddr, uint256 amount);

  constructor(address wrappedEtherContractAddress) {
    contractAddress = wrappedEtherContractAddress;
  }

  function execute(AssetAmount[] calldata inputAssetAmounts, bytes calldata) external payable returns (WorkflowStepResult memory) {
    require(inputAssetAmounts.length == 1, 'WrapNativeAction: inputAssetAmounts.length must be 1');
    console.log('wrap native', inputAssetAmounts[0].amount);
    uint256 amount = inputAssetAmounts[0].amount;
    emit NativeWrapped(address(this), amount);
    Weth weth = Weth(contractAddress);
    weth.deposit{value: amount}();

    WorkflowStepResult memory rv = LibStepResultBuilder
      .create(1, 1)
      .addInputAssetAmount(inputAssetAmounts[0])
      .addOutputToken(contractAddress, amount)
      .result;

    console.log('rv.inputAssetAmounts.length', rv.inputAssetAmounts.length);
    return rv;
  }
}
