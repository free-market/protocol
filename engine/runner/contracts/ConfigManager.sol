// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './EternalStorage.sol';
import './StepInfo.sol';
import './LibConfigReader.sol';
import './FreeMarketBase.sol';
import './FrontDoor.sol';

contract ConfigManager is FreeMarketBase {
  constructor(
    address payable frontDoorAddress
  )
    FreeMarketBase(
      msg.sender, // owner
      FrontDoor(frontDoorAddress).eternalStorageAddress(), // eternal storage address
      address(0), // upstream (this doesn't have one)
      false // isUserProxy
    )
  {}

  function getStepAddress(uint16 stepTypeId) external view returns (address) {
    return LibConfigReader.getStepAddressInternal(eternalStorageAddress, stepTypeId);
  }

  function getStepCount() external view returns (uint256) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.lengthEnumerableMapUintToAddress(LibConfigReader.latestStepAddresses);
  }

  function getStepInfoAt(uint256 index) public view returns (StepInfo memory) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    (uint256 stepTypeId, address stepAddress) = eternalStorage.atEnumerableMapUintToAddress(LibConfigReader.latestStepAddresses, index);

    bytes32 whitelistKey = LibConfigReader.getStepWhitelistKey(uint16(stepTypeId));
    uint256 whitelistCount = eternalStorage.lengthEnumerableMapAddressToUint(whitelistKey);
    address[] memory whitelist = new address[](whitelistCount);
    for (uint256 i = 0; i < whitelistCount; ++i) {
      (address whitelistedAddress, ) = eternalStorage.atEnumerableMapAddressToUint(whitelistKey, i);
      whitelist[i] = whitelistedAddress;
    }

    bytes32 blacklistKey = LibConfigReader.getStepBlacklistKey(uint16(stepTypeId));
    uint256 blacklistCount = eternalStorage.lengthEnumerableMapAddressToUint(blacklistKey);
    address[] memory blacklist = new address[](blacklistCount);
    for (uint256 i = 0; i < blacklistCount; ++i) {
      (address blacklistedAddress, ) = eternalStorage.atEnumerableMapAddressToUint(blacklistKey, i);
      blacklist[i] = blacklistedAddress;
    }

    return StepInfo(uint16(stepTypeId), stepAddress, whitelist, blacklist);
  }

  event StepAddressSetEvent(uint16 stepTypeId, address stepAddress);

  function setStepAddress(uint16 stepTypeId, address stepAddress) external onlyOwner {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    eternalStorage.setEnumerableMapUintToAddress(LibConfigReader.latestStepAddresses, stepTypeId, stepAddress);
    // using the white list map like a set, we only care about the keys
    eternalStorage.setEnumerableMapAddressToUint(LibConfigReader.getStepWhitelistKey(stepTypeId), stepAddress, 0);
    eternalStorage.removeEnumerableMapAddressToUint(LibConfigReader.getStepBlacklistKey(stepTypeId), stepAddress);
    emit StepAddressSetEvent(stepTypeId, stepAddress);
  }

  function removeStepAddress(uint16 stepTypeId, address stepAddress) external onlyOwner {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    address latest = eternalStorage.getEnumerableMapUintToAddress(LibConfigReader.latestStepAddresses, stepTypeId);
    require(stepAddress != latest, 'cannot remove latest step address');
    eternalStorage.setEnumerableMapAddressToUint(LibConfigReader.getStepBlacklistKey(stepTypeId), stepAddress, 0);
    eternalStorage.removeEnumerableMapAddressToUint(LibConfigReader.getStepWhitelistKey(stepTypeId), stepAddress);
    emit StepAddressSetEvent(stepTypeId, stepAddress);
  }
}
