// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

library libAssetBalances {
  uint8 constant MAX_ENTRIES = 20;

  struct AssetBalance {
    uint256 asset;
    int256 balance;
  }

  struct AssetBalances {
    AssetBalance[MAX_ENTRIES] entries;
    uint8 end;
  }

  // function getAssetBalanceMemory(AssetBalances memory entrySet, Asset memory token) internal pure returns (uint256) {
  //   return getAssetBalance(entrySet, toIntMemory(token));
  // }

  // function getAssetBalanceCalldata(AssetBalances memory entrySet, Asset calldata token) internal pure returns (uint256) {
  //   return getAssetBalance(entrySet, toIntCalldata(token));
  // }

  function getAssetBalance(AssetBalances memory entrySet, uint256 assetAsInt) internal pure returns (int256) {
    AssetBalance[MAX_ENTRIES] memory entries = entrySet.entries;
    for (uint16 i = 0; i < entrySet.end; ++i) {
      if (entries[i].asset == assetAsInt) {
        return entries[i].balance;
      }
    }
    return 0;
  }

  function credit(
    AssetBalances memory entrySet,
    uint256 assetAsInt,
    int256 amount
  ) internal pure returns (int256) {
    AssetBalance[MAX_ENTRIES] memory entries = entrySet.entries;
    uint256 i = 0;
    for (; i < entrySet.end; ++i) {
      if (entries[i].asset == assetAsInt) {
        entries[i].balance += amount;
        if (entries[i].balance == 0) {
          entries[i] = entries[entrySet.end - 1];
          --entrySet.end;
        }
        return entries[i].balance;
      }
    }
    require(i < MAX_ENTRIES, 'too many token balances');
    entries[i] = AssetBalance(assetAsInt, amount);
    ++entrySet.end;
    return amount;
  }

  function debit(
    AssetBalances memory entrySet,
    uint256 assetAsInt,
    int256 amount
  ) internal pure returns (int256) {
    return credit(entrySet, assetAsInt, amount * -1);
  }
}
