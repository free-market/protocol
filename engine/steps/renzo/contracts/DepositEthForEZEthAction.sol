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
import './IRestakeManager.sol';

import "./IRenzoOracle.sol";


contract DepositEthForEZEthAction is IWorkflowStep {
  using LibStepResultBuilder for StepResultBuilder;

  struct DepositEthForEZEthActionParams {
    uint256 minEzEthReceived;
  }

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
    bytes calldata argData,
    address
  ) public payable returns (WorkflowStepResult memory) {
    //console.log('entering DepositEthForEZEthAction');

    // validate
    require(inputAssetAmounts.length == 1, 'there must be exactly 1 input asset');
    require(inputAssetAmounts[0].asset.assetType == AssetType.Native, "onlyEthInput");
    require(inputAssetAmounts[0].asset.assetAddress == address(0), "onlyEthInput");
    uint ezEthBalanceBefore = ezEth.balanceOf(address(this));
    DepositEthForEZEthActionParams memory params = abi.decode(argData, (DepositEthForEZEthActionParams));
    //console.log('depositETH', inputAssetAmounts[0].amount);
    //uint beforeGasLeft = gasleft();
    restakeManager.depositETH{value: inputAssetAmounts[0].amount}();
    //console.log('gas used Renzo', beforeGasLeft - gasleft());
    // uint ezEthBalanceAfter = ezEth.balanceOf(address(this));
    uint ezEthReceived = ezEth.balanceOf(address(this)) - ezEthBalanceBefore;
    //console.log('ezEthReceived', ezEthReceived);
    require(ezEthReceived >= params.minEzEthReceived, "insufficientEzEthReceived");
    //console.log('finishing DepositEthForEZEthAction. received ezEth = ', ezEthReceived);
    return
      LibStepResultBuilder
        .create(1, 1)
        .addInputAssetAmount(inputAssetAmounts[0])
        .addOutputAssetAmount(AssetAmount({asset: Asset({assetType: AssetType.ERC20, assetAddress: address(ezEth)}), amount: ezEthReceived}))
        .result;
  }

  function calculateEzEthMintAmount(uint inputEth) public view returns (uint) {
    (, , uint256 totalTVL) = restakeManager.calculateTVLs();
    IRenzoOracle oracle = IRenzoOracle(restakeManager.renzoOracle()); 
    return oracle.calculateMintAmount(totalTVL, inputEth, ezEth.totalSupply());
  }
  
}
