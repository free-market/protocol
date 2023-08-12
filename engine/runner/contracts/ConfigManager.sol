// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './EternalStorage.sol';
import './StepInfo.sol';
import './LibConfigReader.sol';
import './FreeMarketBase.sol';
import './FrontDoor.sol';

struct StepFee {
  uint16 stepTypeId;
  bool feeIsPercent;
  uint256 fee;
}

contract ConfigManager is FreeMarketBase {
  address public immutable frontDoorAddress;

  event StepFeeUpdated(uint16 stepTypeId, uint256 oldFee, bool oldFeeIsPercent, uint256 newFee, bool newFeeIsPercent);
  event DefaultFeeUpdated(uint256 oldFee, bool oldFeeIsPercent, uint256 newFee, bool newFeeIsPercent);

  constructor(
    address payable _frontDoorAddress
  )
    FreeMarketBase(
      msg.sender, // owner
      FrontDoor(_frontDoorAddress).eternalStorageAddress(), // eternal storage address
      address(0), // upstream (this doesn't have one)
      false // isUserProxy
    )
  {
    frontDoorAddress = _frontDoorAddress;
  }

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

    (uint256 fee, bool feeIsPercent) = LibConfigReader.getStepFee(eternalStorageAddress, uint16(stepTypeId));
    return StepInfo(uint16(stepTypeId), feeIsPercent, fee, stepAddress, whitelist, blacklist);
  }

  event StepAddressSetEvent(uint16 stepTypeId, address stepAddress);

  function setStepAddress(uint16 stepTypeId, address stepAddress) external onlyOwner {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    eternalStorage.setEnumerableMapUintToAddress(LibConfigReader.latestStepAddresses, stepTypeId, stepAddress);
    // using the white list map like a set, we only care about the keys
    // this sets it as the current step for the stepTypeId
    eternalStorage.setEnumerableMapAddressToUint(LibConfigReader.getStepWhitelistKey(stepTypeId), stepAddress, 0);
    // this adds it to the list of all valid steps
    eternalStorage.setEnumerableMapAddressToUint(LibConfigReader.allStepAddresses, stepAddress, 0);
    // remove it from the black list just in case it was there
    eternalStorage.removeEnumerableMapAddressToUint(LibConfigReader.getStepBlacklistKey(stepTypeId), stepAddress);
    emit StepAddressSetEvent(stepTypeId, stepAddress);
  }

  function removeStepAddress(uint16 stepTypeId, address stepAddress) external onlyOwner {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    address latest = eternalStorage.getEnumerableMapUintToAddress(LibConfigReader.latestStepAddresses, stepTypeId);
    require(stepAddress != latest, 'cannot remove latest step address');
    eternalStorage.setEnumerableMapAddressToUint(LibConfigReader.getStepBlacklistKey(stepTypeId), stepAddress, 0);
    eternalStorage.removeEnumerableMapAddressToUint(LibConfigReader.getStepWhitelistKey(stepTypeId), stepAddress);
    eternalStorage.removeEnumerableMapAddressToUint(LibConfigReader.allStepAddresses, stepAddress);
    emit StepAddressSetEvent(stepTypeId, stepAddress);
  }

  function addRunnerAddress(address runnerAddress) external onlyOwner {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    // using the map like a set, we only care about the keys
    eternalStorage.setEnumerableMapAddressToUint(LibConfigReader.runnerAddresses, runnerAddress, 0);
  }

  function removeRunnerAddress(address runnerAddress) external onlyOwner {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    eternalStorage.removeEnumerableMapAddressToUint(LibConfigReader.runnerAddresses, runnerAddress);
  }

  function getRunnerAddresses() external view returns (address[] memory) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    uint256 count = eternalStorage.lengthEnumerableMapAddressToUint(LibConfigReader.runnerAddresses);
    address[] memory runners = new address[](count);
    for (uint256 i = 0; i < count; ++i) {
      (address runnerAddress, ) = eternalStorage.atEnumerableMapAddressToUint(LibConfigReader.runnerAddresses, i);
      runners[i] = runnerAddress;
    }
    return runners;
  }

  function setDefaultFee(uint256 fee, bool feeIsPercent) external onlyOwner {
    require(feeIsPercent || fee & LibConfigReader.FEE_MASK == 0, 'absolute fee out of bounds');
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    uint256 encodedFee = LibConfigReader.encodeFee(fee, feeIsPercent);
    bytes32 feeKey = LibConfigReader.getDefaultFeeKey();
    uint256 existingEncodedFee = eternalStorage.getUint(LibConfigReader.getDefaultFeeKey());
    if (encodedFee != existingEncodedFee) {
      eternalStorage.setUint(feeKey, encodedFee);
      (uint256 existingFee, bool existingFeeIsPercent) = LibConfigReader.decodeFee(encodedFee);
      emit DefaultFeeUpdated(existingFee, existingFeeIsPercent, fee, feeIsPercent);
    }
  }

  function setStepFees(StepFee[] calldata stepFeeUpdates) external onlyOwner {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    for (uint256 i = 0; i < stepFeeUpdates.length; ++i) {
      // if its an absolute value, it cannot have the top bit set
      require(stepFeeUpdates[i].feeIsPercent || stepFeeUpdates[i].fee & LibConfigReader.FEE_MASK == 0, 'absolute fee out of bounds');
      bytes32 feeKey = LibConfigReader.getStepFeeKey(stepFeeUpdates[i].stepTypeId);
      // read the exising fee data and see if it's changing
      uint256 existingFeeEncoded = eternalStorage.getUint(feeKey);
      uint256 feeEncoded = LibConfigReader.encodeFee(stepFeeUpdates[i].fee, stepFeeUpdates[i].feeIsPercent);
      if (feeEncoded != existingFeeEncoded) {
        (uint256 existingFee, bool existingFeeIsPercent) = LibConfigReader.decodeFee(existingFeeEncoded);
        emit StepFeeUpdated(
          stepFeeUpdates[i].stepTypeId,
          existingFee,
          existingFeeIsPercent,
          stepFeeUpdates[i].fee,
          stepFeeUpdates[i].feeIsPercent
        );
        eternalStorage.setUint(feeKey, feeEncoded);
      }
    }
  }

  function getStepFee(uint16 stepTypeId) external view returns (uint256, bool) {
    return LibConfigReader.getStepFee(eternalStorageAddress, stepTypeId);
  }

  function getDefaultFee() external view returns (uint256, bool) {
    return LibConfigReader.getDefaultFee(eternalStorageAddress);
  }

  function getSubscribers() external view returns (address[] memory) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    uint256 count = eternalStorage.lengthEnumerableMapAddressToUint(LibConfigReader.subscribers);
    address[] memory subscribers = new address[](count);
    for (uint256 i = 0; i < count; ++i) {
      (address subscriber, ) = eternalStorage.atEnumerableMapAddressToUint(LibConfigReader.subscribers, i);
      subscribers[i] = subscriber;
    }
    return subscribers;
  }

  // not very scalable, but OK for now
  // would be better to add/remove subscribers one at a time
  function updateSubscribers(address[] calldata newSubscribers) external {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    // delete all existing subscribers
    while (true) {
      uint256 count = eternalStorage.lengthEnumerableMapAddressToUint(LibConfigReader.subscribers);
      if (count == 0) {
        break;
      }
      (address subscriber, ) = eternalStorage.atEnumerableMapAddressToUint(LibConfigReader.subscribers, count - 1);
      eternalStorage.removeEnumerableMapAddressToUint(LibConfigReader.subscribers, subscriber);
    }

    // add current subscribers back in
    for (uint256 i = 0; i < newSubscribers.length; ++i) {
      eternalStorage.setEnumerableMapAddressToUint(LibConfigReader.subscribers, newSubscribers[i], 0);
    }
  }

  function getAllStepAddesses() external view returns (address[] memory) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    uint256 count = eternalStorage.lengthEnumerableMapAddressToUint(LibConfigReader.allStepAddresses);
    address[] memory subscribers = new address[](count);
    for (uint256 i = 0; i < count; ++i) {
      (address subscriber, ) = eternalStorage.atEnumerableMapAddressToUint(LibConfigReader.allStepAddresses, i);
      subscribers[i] = subscriber;
    }
    return subscribers;
  }
}
