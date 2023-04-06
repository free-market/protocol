// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@freemarket/core/contracts/model/AssetType.sol";
import "@freemarket/core/contracts/model/WorkflowStepResult.sol";

struct StepResultBuilder {
    uint256 inputIndex;
    uint256 outputIndex;
    WorkflowStepResult result;
}

library LibStepResultBuilder {
    function create(uint256 inputAssetCount, uint256 outputAssetCount)
        internal
        pure
        returns (StepResultBuilder memory)
    {
        AssetAmount[] memory inputAssetAmounts = new AssetAmount[](inputAssetCount);
        AssetAmount[] memory ouputAssetAmounts = new AssetAmount[](outputAssetCount);
        return StepResultBuilder(0, 0, WorkflowStepResult(inputAssetAmounts, ouputAssetAmounts, -2));
    }

    function addInputToken(StepResultBuilder memory builder, address tokenAddress, uint256 amount)
        internal
        pure
        returns (StepResultBuilder memory)
    {
        builder.result.inputAssetAmounts[builder.inputIndex++] =
            AssetAmount(Asset(AssetType.ERC20, tokenAddress), amount);
        return builder;
    }

    function addInputAssetAmount(StepResultBuilder memory builder, AssetAmount memory assetAmount)
        internal
        pure
        returns (StepResultBuilder memory)
    {
        builder.result.inputAssetAmounts[builder.inputIndex++] = assetAmount;
        return builder;
    }

    function addOutputToken(StepResultBuilder memory builder, address tokenAddress, uint256 amount)
        internal
        pure
        returns (StepResultBuilder memory)
    {
        builder.result.outputAssetAmounts[builder.outputIndex++] =
            AssetAmount(Asset(AssetType.ERC20, tokenAddress), amount);
        return builder;
    }

    function addInputNative(StepResultBuilder memory builder, uint256 amount)
        internal
        pure
        returns (StepResultBuilder memory)
    {
        builder.result.inputAssetAmounts[builder.inputIndex++] = AssetAmount(Asset(AssetType.ERC20, address(0)), amount);
        return builder;
    }

    function addOutputNative(StepResultBuilder memory builder, uint256 amount)
        internal
        pure
        returns (StepResultBuilder memory)
    {
        builder.result.outputAssetAmounts[builder.outputIndex++] =
            AssetAmount(Asset(AssetType.ERC20, address(0)), amount);
        return builder;
    }

    function addOutputAssetAmount(StepResultBuilder memory builder, AssetAmount memory assetAmount)
        internal
        pure
        returns (StepResultBuilder memory)
    {
        builder.result.outputAssetAmounts[builder.outputIndex++] = assetAmount;
        return builder;
    }

    function setNextStepIndex(StepResultBuilder memory builder, int16 nextStepIndex)
        internal
        pure
        returns (StepResultBuilder memory)
    {
        builder.result.nextStepIndex = nextStepIndex;
        return builder;
    }
}
