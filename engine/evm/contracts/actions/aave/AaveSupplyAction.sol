// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '../../IWorkflowStep.sol';
import '../../LibActionHelpers.sol';
import './IAaveV3Pool.sol';
import '../../model/Workflow.sol';
import '../../model/AssetAmount.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

// import {IPool} from '@aave/core-v3/contracts/interfaces/IPool.sol';
// import {DataTypes} from '@aave/core-v3/contracts/protocol/libraries/types/DataTypes.sol';

contract AaveSupplyAction is IWorkflowStep {
  address public immutable poolAddress;

  /// @notice This event is emitted when an Aave 'supply' action is executed.
  /// @param inputAssetAmount the asset and amout being supplied to Aave.
  event AaveSupplyActionEvent(AssetAmount inputAssetAmount);

  constructor(address _aavePoolAddress) {
    poolAddress = _aavePoolAddress;
  }

  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    Asset[] calldata,
    bytes calldata
  ) public payable returns (WorkflowStepResult memory) {
    // validate
    require(inputAssetAmounts.length == 1, 'there must be exactly 1 input asset');
    require(inputAssetAmounts[0].asset.assetType == AssetType.ERC20, 'the input asset must be an ERC20');
    // require(outputAssets.length == 1, 'there must be exactly 1 output asset when keeping the aToken in the engine');

    emit AaveSupplyActionEvent(inputAssetAmounts[0]);

    // approve aave to take the asset
    IERC20(inputAssetAmounts[0].asset.assetAddress).approve(poolAddress, inputAssetAmounts[0].amount);

    // get the aToken
    IAaveV3Pool pool = IAaveV3Pool(poolAddress);
    ReserveData memory reserveData = pool.getReserveData(inputAssetAmounts[0].asset.assetAddress);
    IERC20 aToken = IERC20(reserveData.aTokenAddress);

    // take note of the before balance
    uint256 aTokenBalanceBefore = aToken.balanceOf(address(this));

    // invoke supply
    pool.supply(inputAssetAmounts[0].asset.assetAddress, inputAssetAmounts[0].amount, address(this), 0);
    uint256 aTokenBalanceAfter = aToken.balanceOf(address(this));
    require(aTokenBalanceAfter > aTokenBalanceBefore, 'aToken balance did not increase');

    return LibActionHelpers.singleTokenResult(reserveData.aTokenAddress, aTokenBalanceAfter - aTokenBalanceBefore);
  }
}
