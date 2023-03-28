// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@freemarket/core/contracts/IWorkflowStep.sol";
import "@freemarket/step-sdk/contracts/LibActionHelpers.sol";
import "./IAaveV3Pool.sol";
import "@freemarket/core/contracts/model/AssetAmount.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@freemarket/step-sdk/contracts/LibStepResultBuilder.sol";

using LibStepResultBuilder for StepResultBuilder;

// import {IPool} from '@aave/core-v3/contracts/interfaces/IPool.sol';
// import {DataTypes} from '@aave/core-v3/contracts/protocol/libraries/types/DataTypes.sol';

contract AaveSupplyAction is IWorkflowStep {
    using SafeERC20 for IERC20;

    address public immutable poolAddress;

    /// @notice This event is emitted when an Aave 'supply' action is executed.
    /// @param inputAssetAmount the asset and amout being supplied to Aave.
    event AaveSupplyActionEvent(AssetAmount inputAssetAmount);

    constructor(address _aavePoolAddress) {
        poolAddress = _aavePoolAddress;
    }

    struct Locals {
        IERC20 inputToken;
        IAaveV3Pool pool;
        IERC20 aToken;
        uint256 aTokenBalanceBefore;
        uint256 aTokenBalanceAfter;
        ReserveData reserveData;
    }

    function execute(AssetAmount[] calldata inputAssetAmounts, Asset[] calldata, bytes calldata)
        public
        payable
        returns (WorkflowStepResult memory)
    {
        // validate
        require(inputAssetAmounts.length == 1, "there must be exactly 1 input asset");
        require(inputAssetAmounts[0].asset.assetType == AssetType.ERC20, "the input asset must be an ERC20");
        // require(outputAssets.length == 1, 'there must be exactly 1 output asset when keeping the aToken in the engine');

        emit AaveSupplyActionEvent(inputAssetAmounts[0]);
        Locals memory locals;
        // approve aave to take the asset
        locals.inputToken = IERC20(inputAssetAmounts[0].asset.assetAddress);
        locals.inputToken.safeApprove(poolAddress, inputAssetAmounts[0].amount);

        // get the aToken
        locals.pool = IAaveV3Pool(poolAddress);
        locals.reserveData = locals.pool.getReserveData(inputAssetAmounts[0].asset.assetAddress);
        locals.aToken = IERC20(locals.reserveData.aTokenAddress);

        // take note of the before balance
        locals.aTokenBalanceBefore = locals.aToken.balanceOf(address(this));

        // invoke supply
        locals.pool.supply(inputAssetAmounts[0].asset.assetAddress, inputAssetAmounts[0].amount, address(this), 0);
        locals.aTokenBalanceAfter = locals.aToken.balanceOf(address(this));
        require(locals.aTokenBalanceAfter > locals.aTokenBalanceBefore, "aToken balance did not increase");

        return LibStepResultBuilder.create(1, 1).addInputAssetAmount(inputAssetAmounts[0]).addOutputToken(
            locals.reserveData.aTokenAddress, locals.aTokenBalanceAfter - locals.aTokenBalanceBefore
        ).result;
    }
}
