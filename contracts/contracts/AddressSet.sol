// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

library AddressSet {

    struct Set {
        mapping(address => uint) indexes;
        address[] values;
    }

    function add(Set storage self, address key) internal {
        require(key != address(0), "UnorderedKeySet(100) - Key cannot be 0x0");
        require(!exists(self, key), "UnorderedAddressSet(101) - Address (key) already exists in the set.");
        self.values.push(key);
        self.indexes[key] = self.values.length - 1;
    }

    function remove(Set storage self, address key) internal {
        require(exists(self, key), "UnorderedKeySet(102) - Address (key) does not exist in the set.");
        address keyToMove = self.values[count(self)-1];
        uint rowToReplace = self.indexes[key];
        self.indexes[keyToMove] = rowToReplace;
        self.values[rowToReplace] = keyToMove;
        delete self.indexes[key];
        self.values.pop();
    }

    function count(Set storage self) internal view returns(uint) {
        return(self.values.length);
    }

    function exists(Set storage self, address key) internal view returns(bool) {
        if(self.values.length == 0) return false;
        return self.values[self.indexes[key]] == key;
    }

    function keyAtIndex(Set storage self, uint index) internal view returns(address) {
        return self.values[index];
    }
}