// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// @dev An in-memory key/value store
library Dictionary {
  uint256 constant MAX_ENTRIES = 100;

  struct Entry {
    uint256 key;
    uint256 value;
  }

  struct DictionaryInstance {
    Entry[MAX_ENTRIES] entries;
    uint8 end;
  }

  function newInstance() external pure returns (DictionaryInstance memory) {
    DictionaryInstance memory dic;
    return dic;
  }

  function get(DictionaryInstance memory entrySet, uint256 key) internal pure returns (uint256) {
    for (uint8 i = 0; i < entrySet.end; ++i) {
      if (entrySet.entries[i].key == key) {
        return entrySet.entries[i].value;
      }
    }
    return 0;
  }

  function set(
    DictionaryInstance memory self,
    uint256 key,
    uint256 value
  ) internal pure {
    // linear search for existing key
    for (uint8 i = 0; i < self.end; ++i) {
      if (self.entries[i].key == key) {
        self.entries[i].value = value;
        return;
      }
    }
    // if we're still here then key was not found
    require(self.end < MAX_ENTRIES, 'too many dictionary entries');
    // add the key/val to the dic at the end
    self.entries[self.end] = Entry(key, value);
    ++self.end;
  }

  function remove(DictionaryInstance memory self, uint256 key) internal pure {
    uint8 i = 0;
    for (; i < self.end; ++i) {
      if (self.entries[i].key == key) {
        // end is exclusive, so 'at the end' is at index end-1
        uint8 endMinusOne = self.end - 1;
        // if it's not at the end, swap the last entry into this newly empty slot
        if (i != endMinusOne) {
          self.entries[i] = self.entries[endMinusOne];
        }
        // decrement end
        self.end = endMinusOne;
        return;
      }
    }
    require(i < self.end, 'key not found while removing');
  }
}
