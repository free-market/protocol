// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import './aave-interfaces/IAaveV3Pool.sol';
import '@freemarket/core/contracts/model/AssetAmount.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import '@freemarket/step-sdk/contracts/LibErc20.sol';
import '@freemarket/step-sdk/contracts/LibWethUtils.sol';
import 'hardhat/console.sol';

using LibStepResultBuilder for StepResultBuilder;
using LibErc20 for IERC20;

contract AaveSupplyAction is IWorkflowStep {
  address public immutable poolAddress;
  address public immutable wethAddress;

  /// @notice This event is emitted when an Aave 'supply' action is executed.
  /// @param inputAssetAmount the asset and amout being supplied to Aave.
  event AaveSupplyActionEvent(AssetAmount inputAssetAmount);

  constructor(address _aavePoolAddress, address _wethAddress) {
    poolAddress = _aavePoolAddress;
    wethAddress = _wethAddress;
  }

  struct Locals {
    IERC20 inputToken;
    address inputTokenAddress;
    IAaveV3Pool pool;
    IERC20 aToken;
    uint256 aTokenBalanceBefore;
    uint256 aTokenBalanceAfter;
    ReserveData reserveData;
  }

  function execute(
    AssetAmount[] calldata assetAmounts,
    bytes calldata,
    address userAddress
  ) public payable returns (WorkflowStepResult memory) {
    console.log('entering aave supply action', address(this));
    // validate
    require(assetAmounts.length == 1, 'there must be exactly 1 input asset');

    emit AaveSupplyActionEvent(assetAmounts[0]);
    Locals memory locals;

    console.log('assetAmounts[0].asset.address', assetAmounts[0].asset.assetAddress);

    locals.inputTokenAddress = LibWethUtils.wrapIfNecessary(assetAmounts[0], wethAddress);
    console.log('locals.inputTokenAddress', locals.inputTokenAddress);

    // approve aave to take the asset
    locals.inputToken = IERC20(locals.inputTokenAddress);

    console.log('myBalance', locals.inputToken.balanceOf(address(this)));
    console.log('approving', assetAmounts[0].amount);
    locals.inputToken.safeApprove(poolAddress, assetAmounts[0].amount);

    // get the aToken
    locals.pool = IAaveV3Pool(poolAddress);
    locals.reserveData = locals.pool.getReserveData(locals.inputTokenAddress);

    // invoke supply
    console.log('invoking supply');
    locals.pool.supply(locals.inputTokenAddress, assetAmounts[0].amount, userAddress, 0);

    return
      LibStepResultBuilder
        .create(1, 0, 1)
        .addInputAssetAmount(assetAmounts[0])
        .addOutputAssetAmountToCaller(AssetAmount(Asset(AssetType.ERC20, locals.reserveData.aTokenAddress), assetAmounts[0].amount))
        .result;
  }
}
