// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/step-sdk/contracts/IWeth.sol';
import '@freemarket/core/contracts/model/AssetAmount.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
// import 'hardhat/console.sol';

import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import '@freemarket/step-sdk/contracts/LibErc20.sol';
import '@freemarket/step-sdk/contracts/LibWethUtils.sol';
import './IStEth.sol';
import './AbstractLidoAction.sol';
/*
docs say stEth issuance should be 1:1, but I've noticed stEth can be a few wei short

for ex:
input ETH    1000000000000000
output stEth: 999999999999998
*/

contract DepositEthForStEthAction is IWorkflowStep, AbstractLidoAction {
  using LibStepResultBuilder for StepResultBuilder;
  
  struct DepositEthForStEthActionParams {
    uint256 minStEthReceived;
    address referral;
  }


  constructor(address _stEth) AbstractLidoAction(_stEth) {}
  
  /*
    swap ETH for ezETH
  */
  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    bytes calldata argData,
    address
  ) public payable override returns (WorkflowStepResult memory) {
    //console.log('entering DepositEthForStEthAction');
    DepositEthForStEthActionParams memory params = abi.decode(argData, (DepositEthForStEthActionParams));

    // validate
    require(inputAssetAmounts.length == 1, 'there must be exactly 1 input asset');
    require(inputAssetAmounts[0].asset.assetType == AssetType.Native, "onlyEthInput");
    require(inputAssetAmounts[0].asset.assetAddress == address(0), "onlyEthInput");
    uint stEthBalanceBefore = stEth.balanceOf(address(this));
    //console.log('depositETH', inputAssetAmounts[0].amount);
    //uint beforeGasLeft = gasleft();
    stEth.submit{value: inputAssetAmounts[0].amount}(params.referral);
    //console.log('gas used Renzo', beforeGasLeft - gasleft());
    // uint stEthBalanceAfter = stEth.balanceOf(address(this));
    uint stEthReceived = stEth.balanceOf(address(this)) - stEthBalanceBefore;
    //console.log('stEthReceived', stEthReceived);
    // stEth issuance should be 1:1
    require(stEthReceived >= params.minStEthReceived, "insufficientStEthReceived");
    //console.log('finishing DepositEthForStEthAction. received stEth = ', stEthReceived);
    return
      LibStepResultBuilder
        .create(1, 1)
        .addInputAssetAmount(inputAssetAmounts[0])
        .addOutputAssetAmount(AssetAmount({asset: Asset({assetType: AssetType.ERC20, assetAddress: address(stEth)}), amount: stEthReceived}))
        .result;
  }
  
}
