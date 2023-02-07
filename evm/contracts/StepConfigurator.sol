// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

import './model/Workflow.sol';
import './FrontDoor.sol';
import './IWorkflowRunner.sol';
import './IActionManager.sol';
import './IUserProxyManager.sol';
import './UserProxy.sol';
import './LibAssetBalances.sol';
import './LibStorageWriter.sol';
import './EternalStorage.sol';
import './IWorkflowStep.sol';
import './LibAsset.sol';

contract StepConfigurator is FreeMarketBase, IActionManager {
  constructor(address payable frontDoorAddress)
    FreeMarketBase(
      msg.sender, // owner
      FrontDoor(frontDoorAddress).eternalStorageAddress(), // eternal storage address
      address(0), // upstream (this doesn't have one)
      false // isUserProxy
    )
  {}

  // latestActionAddresses maps actionId to latest and greatest version of that action
  bytes32 constant latestActionAddresses = 0xc94d198e6194ea38dbd900920351d7f8e6c6d85b1d3b803fb93c54be008e11fd; // keccak256('latestActionAddresses')

  event ActionAddressSetEvent(uint16 actionId, address actionAddress);

  function getActionWhitelistKey(uint16 actionId) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked('actionWhiteList', actionId));
  }

  function getActionBlacklistKey(uint16 actionId) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked('actionBlackList', actionId));
  }

  function setActionAddress(uint16 actionId, address actionAddress) external onlyOwner {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    eternalStorage.setEnumerableMapUintToAddress(latestActionAddresses, actionId, actionAddress);
    // using the white list map like a set, we only care about the keys
    eternalStorage.setEnumerableMapAddressToUint(getActionWhitelistKey(actionId), actionAddress, 0);
    eternalStorage.removeEnumerableMapAddressToUint(getActionBlacklistKey(actionId), actionAddress);
    emit ActionAddressSetEvent(actionId, actionAddress);
  }

  function removeActionAddress(uint16 actionId, address actionAddress) external onlyOwner {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    address latest = eternalStorage.getEnumerableMapUintToAddress(latestActionAddresses, actionId);
    require(actionAddress != latest, 'cannot remove latest action address');
    eternalStorage.setEnumerableMapAddressToUint(getActionBlacklistKey(actionId), actionAddress, 0);
    eternalStorage.removeEnumerableMapAddressToUint(getActionWhitelistKey(actionId), actionAddress);
    emit ActionAddressSetEvent(actionId, actionAddress);
  }

  function getActionAddress(uint16 actionId) external view returns (address) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.getEnumerableMapUintToAddress(latestActionAddresses, actionId);
  }

  function getActionAddressInternal(uint16 actionId) internal view returns (address) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.getEnumerableMapUintToAddress(latestActionAddresses, actionId);
  }

  function getActionCount() external view returns (uint256) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.lengthEnumerableMapUintToAddress(latestActionAddresses);
  }

  function getActionInfoAt(uint256 index) public view returns (ActionInfo memory) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    (uint256 actionId, address actionAddress) = eternalStorage.atEnumerableMapUintToAddress(latestActionAddresses, index);

    bytes32 whitelistKey = getActionWhitelistKey(uint16(actionId));
    uint256 whitelistCount = eternalStorage.lengthEnumerableMapAddressToUint(whitelistKey);
    address[] memory whitelist = new address[](whitelistCount);
    for (uint256 i = 0; i < whitelistCount; ++i) {
      (address whitelistedAddress, ) = eternalStorage.atEnumerableMapAddressToUint(whitelistKey, i);
      whitelist[i] = whitelistedAddress;
    }

    bytes32 blacklistKey = getActionBlacklistKey(uint16(actionId));
    uint256 blacklistCount = eternalStorage.lengthEnumerableMapAddressToUint(blacklistKey);
    address[] memory blacklist = new address[](blacklistCount);
    for (uint256 i = 0; i < blacklistCount; ++i) {
      (address blacklistedAddress, ) = eternalStorage.atEnumerableMapAddressToUint(blacklistKey, i);
      blacklist[i] = blacklistedAddress;
    }

    return ActionInfo(uint16(actionId), actionAddress, whitelist, blacklist);
  }
}
