// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/step-sdk/contracts/LibActionHelpers.sol';
import './IPhiatV3Pool.sol';
import '@freemarket/core/contracts/model/AssetAmount.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import '@freemarket/step-sdk/contracts/LibErc20.sol';

using LibStepResultBuilder for StepResultBuilder;
using LibErc20 for IERC20;

// import {IPool} from '@phiat/core-v3/contracts/interfaces/IPool.sol';
// import {DataTypes} from '@phiat/core-v3/contracts/protocol/libraries/types/DataTypes.sol';

contract PhiatSupplyAction is IWorkflowStep {
  address public immutable poolAddress;

  /// @notice This event is emitted when an Phiat 'supply' action is executed.
  /// @param inputAssetAmount the asset and amout being supplied to Phiat.
  event PhiatSupplyActionEvent(AssetAmount inputAssetAmount);

  constructor(address _phiatPoolAddress) {
    poolAddress = _phiatPoolAddress;
  }

  struct Locals {
    IERC20 inputToken;
    IPhiatV3Pool pool;
    IERC20 aToken;
    uint256 aTokenBalanceBefore;
    uint256 aTokenBalanceAfter;
    ReserveData reserveData;
  }

  function execute(AssetAmount[] calldata assetAmounts, bytes calldata) public payable returns (WorkflowStepResult memory) {
    // validate
    require(assetAmounts.length == 1, 'there must be exactly 1 input asset');
    require(assetAmounts[0].asset.assetType == AssetType.ERC20, 'the input asset must be an ERC20');
    // require(outputAssets.length == 1, 'there must be exactly 1 output asset when keeping the aToken in the engine');

    emit PhiatSupplyActionEvent(assetAmounts[0]);
    Locals memory locals;

    // approve phiat to take the asset
    locals.inputToken = IERC20(assetAmounts[0].asset.assetAddress);
    locals.inputToken.safeApprove(poolAddress, assetAmounts[0].amount);

    // get the aToken
    locals.pool = IPhiatV3Pool(poolAddress);
    locals.reserveData = locals.pool.getReserveData(assetAmounts[0].asset.assetAddress);
    locals.aToken = IERC20(locals.reserveData.aTokenAddress);

    // take note of the before balance
    locals.aTokenBalanceBefore = locals.aToken.balanceOf(address(this));

    // invoke supply
    locals.pool.supply(assetAmounts[0].asset.assetAddress, assetAmounts[0].amount, address(this), 0);

    locals.aTokenBalanceAfter = locals.aToken.balanceOf(address(this));
    require(locals.aTokenBalanceAfter > locals.aTokenBalanceBefore, 'aToken balance did not increase');

    return
      LibStepResultBuilder
        .create(1, 1)
        .addInputAssetAmount(assetAmounts[0])
        .addOutputToken(locals.reserveData.aTokenAddress, locals.aTokenBalanceAfter - locals.aTokenBalanceBefore)
        .result;
  }
}
