// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

library TokenAmounts {
  uint8 constant MAX_ENTRIES = 20;

  struct Entry {
    address key;
    uint256 value;
  }

  struct EntrySet {
    Entry[MAX_ENTRIES] entries;
    uint8 end;
  }

  function get(EntrySet memory entrySet, address token) internal pure returns (uint256) {
    Entry[MAX_ENTRIES] memory entries = entrySet.entries;
    for (uint16 i = 0; i < entrySet.end; ++i) {
      if (entries[i].key == token) {
        return entries[i].value;
      }
    }
    return 0;
  }

  function add(
    EntrySet memory entrySet,
    address token,
    uint256 amount
  ) internal pure returns (uint256) {
    Entry[MAX_ENTRIES] memory entries = entrySet.entries;
    uint256 i = 0;
    for (; i < entrySet.end; ++i) {
      if (entries[i].key == token) {
        entries[i].value += amount;
        return entries[i].value;
      }
    }
    require(i < MAX_ENTRIES, 'too many token balances');
    entries[i] = Entry(token, amount);
    ++entrySet.end;
    return amount;
  }

  function subtract(
    EntrySet memory entrySet,
    address token,
    uint256 amount
  ) internal pure returns (uint256) {
    Entry[MAX_ENTRIES] memory entries = entrySet.entries;
    uint256 i = 0;
    for (; i < entrySet.end; ++i) {
      if (entries[i].key == token) {
        uint256 value = entries[i].value;
        value -= amount;
        entries[i].value = value;
        if (value == 0) {
          entries[i] = entries[entrySet.end - 1];
          --entrySet.end;
        }
        return value;
      }
    }
    require(i < entrySet.end, 'token not found while subtracting');
    entries[i] = Entry(token, amount);
    return amount;
  }
}
