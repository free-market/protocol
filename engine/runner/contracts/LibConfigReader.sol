// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './EternalStorage.sol';

library LibConfigReader {
  string constant STEP_FEES_KEY = 'stepFees';
  string constant DEFAULT_FEE_KEY = 'defaultFees';
  uint256 constant FEE_MASK = 0x8000000000000000000000000000000000000000000000000000000000000000;

  // latestStepAddresses maps stepTypeId to latest and greatest version of that step
  bytes32 constant latestStepAddresses = 0xc94d198e6194ea38dbd900920351d7f8e6c6d85b1d3b803fb93c54be008e11fd; // keccak256('latestActionAddresses')
  bytes32 constant runnerAddresses = 0x32b7d36eef9191cec628a9b46ddda74b702cf693ad48a065f3f9e5fcc4ea08f5; // keccak256('runnerAddresses')
  bytes32 constant allStepAddresses = 0x18fa4b105101c66136345367eab77cd274c0766ec0596b7e8aadd79e99139555; // keccak256('allStepAddresses')
  bytes32 public constant subscribers = keccak256('subscribers');
  bytes32 public constant key_proxyUpstream = keccak256('proxyUpstream');

  // bitset of stepconfig flags
  uint256 public constant STEPCONFIG_CAN_CONTINUE_WORKFLOW = 1 << 1;

//  uint public constant 

  function getProxyUpstream(address eternalStorageAddress) internal view returns (address) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.getAddress(key_proxyUpstream);
  }

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

  function isStepAddressWhitelistedWithFlags(address eternalStorageAddress, uint16 stepTypeId, address stepAddress, uint required_step_flags) internal view returns (bool) {
      (bool success, uint flags) = EternalStorage(eternalStorageAddress).tryGetEnumerableMapAddressToUint(getStepWhitelistKey(stepTypeId), stepAddress);
      if(!success) return false;
      return flags & required_step_flags == required_step_flags;
  }


  function isStepAddressWhitelisted(address eternalStorageAddress, address stepAddress) internal view returns (bool) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.containsEnumerableMapAddressToUint(allStepAddresses, stepAddress);
  }

  function isStepAddressWhitelistedWithFlags(address eternalStorageAddress, address stepAddress, uint required_step_flags) internal view returns (bool) {
      (bool success, uint flags) = EternalStorage(eternalStorageAddress).tryGetEnumerableMapAddressToUint(allStepAddresses, stepAddress);
      if(!success) return false;
      return flags & required_step_flags == required_step_flags;
  }

  function getStepFeeKey(uint16 stepTypeId) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(STEP_FEES_KEY, stepTypeId));
  }

  function getDefaultFeeKey() internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(DEFAULT_FEE_KEY));
  }

  function encodeFee(uint256 _fee, bool isPercent) internal pure returns (uint256) {
    uint256 fee = _fee;
    if (isPercent) {
      fee |= FEE_MASK;
    }
    return fee;
  }

  function decodeFee(uint256 feeEncoded) internal pure returns (uint256, bool) {
    bool isPercent = (feeEncoded & FEE_MASK) > 0;
    uint256 fee = feeEncoded & ~FEE_MASK;
    return (fee, isPercent);
  }

  function getDefaultFee(address eternalStorageAddress) internal view returns (uint256, bool) {
    uint256 encodedFee = EternalStorage(eternalStorageAddress).getUint(getDefaultFeeKey());
    return decodeFee(encodedFee);
  }

  function getStepFee(address eternalStorageAddress, uint16 stepTypeId) internal view returns (uint256, bool) {
    uint256 encodedFee = EternalStorage(eternalStorageAddress).getUint(getStepFeeKey(stepTypeId));
    return decodeFee(encodedFee);
  }

  function isSubscriber(address eternalStorageAddress, address callerAddress) internal view returns (bool) {
    return EternalStorage(eternalStorageAddress).containsEnumerableMapAddressToUint(subscribers, callerAddress);
  }
}
