// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@freemarket/core/contracts/model/WorkflowStep.sol";
import "./LibAssetBalances.sol";
import "hardhat/console.sol";

using LibAssetBalances for LibAssetBalances.AssetBalances;

enum Comparison {
    Equal,
    NotEqual,
    LessThan,
    LessThanOrEqual,
    GreaterThan,
    GreaterThanOrEqual
}

struct AssetBalanceBranchParams {
    Asset asset;
    Comparison comparison;
    uint256 amount;
    int16 ifYes;
}

library AssetBalanceBranch {
    function getNextStepIndex(WorkflowStep memory currentStep, LibAssetBalances.AssetBalances memory assetBalances)
        internal
        view
        returns (int16)
    {
        AssetBalanceBranchParams memory args = abi.decode(currentStep.argData, (AssetBalanceBranchParams));
        Comparison comparision = args.comparison;
        uint256 amount = assetBalances.getAssetBalance(args.asset);
        uint256 argsAmount = args.amount;
        bool result;
        assembly {
            switch comparision
            case 0 { result := eq(amount, argsAmount) }
            case 1 { result := not(eq(amount, argsAmount)) }
            case 2 { result := lt(amount, argsAmount) }
            case 3 { result := or(eq(amount, argsAmount), lt(amount, argsAmount)) }
            case 4 { result := gt(amount, argsAmount) }
            case 5 { result := or(eq(amount, argsAmount), gt(amount, argsAmount)) }
        }
        if (result) {
            console.log("AssetBalanceBranch returing ifYes");
            console.logInt(args.ifYes);
            return args.ifYes;
        }
        console.log("AssetBalanceBranch returing nextStepIndex");
        console.logInt(currentStep.nextStepIndex);
        return currentStep.nextStepIndex;
    }
}
