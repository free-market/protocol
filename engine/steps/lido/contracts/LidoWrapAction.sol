// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './AbstractLidoWrapAction.sol';
import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import 'hardhat/console.sol';

contract LidoWrapAction is AbstractLidoWrapAction, IWorkflowStep {
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
    require(inputAssetAmounts[0].asset.assetAddress == address(stEth), "onlyEthInput");
    uint wstEthBalanceBefore = wstEth.balanceOf(address(this));
    //console.log('depositETH', inputAssetAmounts[0].amount);
    //uint beforeGasLeft = gasleft();
    stEth.approve(address(wstEth), inputAssetAmounts[0].amount);
    wstEth.wrap(inputAssetAmounts[0].amount);
    //console.log('gas used Renzo', beforeGasLeft - gasleft());
    // uint stEthBalanceAfter = stEth.balanceOf(address(this));
    uint wstEthReceived = wstEth.balanceOf(address(this)) - wstEthBalanceBefore;
    console.log('wstEthReceived', wstEthReceived);
    // stEth issuance should be 1:1
    require(wstEthReceived >= params.minOutputAmount, "insufficientWstEthReceived");
    //console.log('finishing DepositEthForStEthAction. received stEth = ', stEthReceived);
    return
      LibStepResultBuilder
        .create(1, 1)
        .addInputAssetAmount(inputAssetAmounts[0])
        .addOutputAssetAmount(AssetAmount({asset: Asset({assetType: AssetType.ERC20, assetAddress: address(wstEth)}), amount: wstEthReceived}))
        .result;
  }


}