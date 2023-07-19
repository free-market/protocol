// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/model/WorkflowStep.sol';
import './LibAssetBalances.sol';
import 'hardhat/console.sol';
import './Comparison.sol';

using LibAssetBalances for LibAssetBalances.AssetBalances;


struct AssetComparisonParams {
  Asset asset;
  Comparison comparison;
  uint256 amount;
  int16 ifYes;
}

enum AssetComparisonType {
  Balance,
  Credit,
  Debit
}

library AssetComparison {
  function getNextStepIndex(
    WorkflowStep memory currentStep,
    LibAssetBalances.AssetBalances memory assetBalances,
    AssetComparisonType assetComparisonType
  ) internal view returns (int16) {
    AssetComparisonParams memory args = abi.decode(currentStep.argData, (AssetComparisonParams));
    Comparison comparision = args.comparison;
    LibAssetBalances.AssetEntry memory assetEntry = LibAssetBalances.getAssetEntry(assetBalances, args.asset);

    uint256 amount;
    if (assetComparisonType == AssetComparisonType.Balance) {
      amount = assetEntry.balance;
    } else  if (assetComparisonType == AssetComparisonType.Credit) {
      amount = assetEntry.previousCredit;
    } else {
      amount = assetEntry.previousDebit;
    }

    uint256 argsAmount = args.amount;
    bool result;
    assembly {
      switch comparision
      case 0 {
        result := eq(amount, argsAmount)
      }
      case 1 {
        result := not(eq(amount, argsAmount))
      }
      case 2 {
        result := lt(amount, argsAmount)
      }
      case 3 {
        result := or(eq(amount, argsAmount), lt(amount, argsAmount))
      }
      case 4 {
        result := gt(amount, argsAmount)
      }
      case 5 {
        result := or(eq(amount, argsAmount), gt(amount, argsAmount))
      }
    }
    if (result) {
      console.log('AssetBalanceBranch returing ifYes');
      console.logInt(args.ifYes);
      return args.ifYes;
    }
    console.log('AssetBalanceBranch returing nextStepIndex');
    console.logInt(currentStep.nextStepIndex);
    return currentStep.nextStepIndex;
  }
}
