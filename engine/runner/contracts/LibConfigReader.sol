// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './EternalStorage.sol';

library LibConfigReader {
  // latestStepAddresses maps stepTypeId to latest and greatest version of that step
  bytes32 constant latestStepAddresses = 0xc94d198e6194ea38dbd900920351d7f8e6c6d85b1d3b803fb93c54be008e11fd; // keccak256('latestActionAddresses')
  bytes32 constant runnerAddresses = 0x32b7d36eef9191cec628a9b46ddda74b702cf693ad48a065f3f9e5fcc4ea08f5; // keccak256('runnerAddresses')
  bytes32 constant allStepAddresses = 0x18fa4b105101c66136345367eab77cd274c0766ec0596b7e8aadd79e99139555; // keccak256('allStepAddresses')

  function getStepAddressInternal(address eternalStorageAddress, uint16 stepTypeId) internal view returns (address) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.getEnumerableMapUintToAddress(latestStepAddresses, stepTypeId);
  }

  function getStepWhitelistKey(uint16 stepTypeId) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked('stepWhiteList', stepTypeId));
  }

  function getStepBlacklistKey(uint16 stepTypeId) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked('stepBlackList', stepTypeId));
  }

  function isStepAddressWhitelisted(address eternalStorageAddress, uint16 stepTypeId, address stepAddress) internal view returns (bool) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.containsEnumerableMapAddressToUint(getStepWhitelistKey(stepTypeId), stepAddress);
  }

  function isStepAddressWhitelisted(address eternalStorageAddress, address stepAddress) internal view returns (bool) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.containsEnumerableMapAddressToUint(allStepAddresses, stepAddress);
  }
}
