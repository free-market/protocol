// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/step-sdk/contracts/IWeth.sol';
import '@freemarket/core/contracts/model/AssetAmount.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import 'hardhat/console.sol';

import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import '@freemarket/step-sdk/contracts/LibErc20.sol';
import '@freemarket/step-sdk/contracts/LibWethUtils.sol';
import './IRestakeManager.sol';

contract DepositEthForEZEthAction is IWorkflowStep {
  using LibStepResultBuilder for StepResultBuilder;

  IRestakeManager public immutable restakeManager;
  IERC20 public immutable ezEth;
  
  constructor(address _restakeManager, address _ezEth) {
    restakeManager = IRestakeManager(_restakeManager);
    ezEth = IERC20(_ezEth);
  }
  /*
    swap ETH for ezETH
  */
  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    bytes calldata,
    address
  ) public payable returns (WorkflowStepResult memory) {
    console.log('entering DepositEthForEZEthAction');

    // validate
    require(inputAssetAmounts.length == 1, 'there must be exactly 1 input asset');
    require(inputAssetAmounts[0].asset.assetType == AssetType.Native, "onlyEthInput");
    require(inputAssetAmounts[0].asset.assetAddress == address(0), "onlyEthInput");
    uint ezEthBalanceBefore = ezEth.balanceOf(address(this));
    restakeManager.depositETH{value: inputAssetAmounts[0].amount}();
    // uint ezEthBalanceAfter = ezEth.balanceOf(address(this));
    uint ezEthReceived = ezEth.balanceOf(address(this)) - ezEthBalanceBefore;
    require(ezEthReceived >= inputAssetAmounts[0].amount, "insufficientEzEthReceived");
    console.log('finishing DepositEthForEZEthAction. received ezEth = ', ezEthReceived);
    return
      LibStepResultBuilder
        .create(1, 1)
        .addInputAssetAmount(inputAssetAmounts[0])
        .addOutputAssetAmount(AssetAmount({asset: Asset({assetType: AssetType.ERC20, assetAddress: address(ezEth)}), amount: ezEthReceived}))
        .result;
  }
  
}
