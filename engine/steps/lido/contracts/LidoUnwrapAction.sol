// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './AbstractLidoWrapAction.sol';
import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';

contract LidoUnwrapAction is AbstractLidoWrapAction, IWorkflowStep {
  using LibStepResultBuilder for StepResultBuilder;

  constructor(address _stEth, address _wstEth) AbstractLidoWrapAction (_stEth, _wstEth) {}
  
  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    bytes calldata argData,
    address
  ) public payable override returns (WorkflowStepResult memory) {
    //console.log('entering DepositEthForStEthAction');
    WrapParams memory params = abi.decode(argData, (WrapParams));

    // validate
    require(inputAssetAmounts.length == 1, 'there must be exactly 1 input asset');
    require(inputAssetAmounts[0].asset.assetType == AssetType.ERC20, "onlyEthInput");
    require(inputAssetAmounts[0].asset.assetAddress == address(wstEth), "onlyEthInput");
    uint stEthBalanceBefore = stEth.balanceOf(address(this));
    wstEth.unwrap(inputAssetAmounts[0].amount);
    uint stEthReceived = stEth.balanceOf(address(this)) - stEthBalanceBefore;
    require(stEthReceived >= params.minOutputAmount, "insufficientStEthReceived");
    return
      LibStepResultBuilder
        .create(1, 1)
        .addInputAssetAmount(inputAssetAmounts[0])
        .addOutputAssetAmount(AssetAmount({asset: Asset({assetType: AssetType.ERC20, assetAddress: address(stEth)}), amount: stEthReceived}))
        .result;
  }


}