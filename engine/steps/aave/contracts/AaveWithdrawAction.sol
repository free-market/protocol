// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import './aave-interfaces/IAaveV3Pool.sol';
import './aave-interfaces/IPriceOracleGetter.sol';
import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import '@freemarket/step-sdk/contracts/LibErc20.sol';
import '@freemarket/step-sdk/contracts/LibWethUtils.sol';
import 'hardhat/console.sol';
import '@freemarket/core/contracts/LibPercent.sol';

using LibStepResultBuilder for StepResultBuilder;
using LibErc20 for IERC20;

struct AaveWithdrawParameters {
  Asset assetToWithdraw;
  uint256 amountToWithdraw;
  bool amountIsPercent;
}

contract AaveWithdrawAction is IWorkflowStep {
  address public immutable poolAddress;
  address public immutable wethAddress;

  constructor(address _aavePoolAddress, address _wethAddress) {
    poolAddress = _aavePoolAddress;
    wethAddress = _wethAddress;
  }

  struct Locals {
    IAaveV3Pool pool;
    ReserveData reserveData;
    // IERC20 inputToken;
    // address inputTokenAddress;
    IERC20 aToken;
    AaveWithdrawParameters args;
  }

  function execute(
    AssetAmount[] calldata assetAmounts,
    bytes calldata argData,
    address userAddress
  ) public payable returns (WorkflowStepResult memory) {
    console.log('entering aave withdraw action');
    // validate
    require(assetAmounts.length == 0, 'there may be no input assets');
    Locals memory locals;
    locals.args = abi.decode(argData, (AaveWithdrawParameters));
    locals.pool = IAaveV3Pool(poolAddress);
    locals.reserveData = locals.pool.getReserveData(locals.args.assetToWithdraw.assetAddress);
    locals.aToken = IERC20(locals.reserveData.aTokenAddress);
    // atokens cannot be transferred 'on behalf of' from the user directly to the pool, the caller must own the aTokens

    uint256 amountToWithdraw;
    if (locals.args.amountIsPercent) {
      (uint256 totalCollateralBase, uint256 totalDebtBase, , , , ) = locals.pool.getUserAccountData(userAddress);
      uint256 freeCollateralBase = totalCollateralBase - totalDebtBase;
      uint256 amountToWithdrawBase = LibPercent.percentageOf(freeCollateralBase, locals.args.amountToWithdraw);
      address priceOracleAddress = locals.pool.ADDRESSES_PROVIDER().getPriceOracle();
      IPriceOracleGetter oracle = IPriceOracleGetter(IPriceOracleGetter(priceOracleAddress));
      uint256 price = oracle.getAssetPrice(locals.args.assetToWithdraw.assetAddress);
      amountToWithdraw = price * amountToWithdrawBase;
      console.log('relative amount', amountToWithdraw);
    } else {
      amountToWithdraw = locals.args.amountToWithdraw;
    }

    // all Aave is 'on behalf of' meaning source is always the caller
    {
      uint256 aTokenBalanceBefore = locals.aToken.balanceOf(address(this));
      console.log('000001');
      locals.aToken.transferFrom(userAddress, address(this), amountToWithdraw);
      console.log('000002');
      uint256 aTokenBalanceAFter = locals.aToken.balanceOf(address(this));
      require(aTokenBalanceAFter - aTokenBalanceBefore == amountToWithdraw, 'aToken transferFrom failed');
    }

    locals.pool.withdraw(locals.args.assetToWithdraw.assetAddress, amountToWithdraw, address(this));

    return
      LibStepResultBuilder
        .create(1, 11)
        .addInputAssetAmount(AssetAmount(Asset(AssetType.ERC20, locals.reserveData.aTokenAddress), amountToWithdraw))
        .addOutputAssetAmount(AssetAmount(Asset(AssetType.ERC20, locals.args.assetToWithdraw.assetAddress), amountToWithdraw))
        .result;
  }
}
