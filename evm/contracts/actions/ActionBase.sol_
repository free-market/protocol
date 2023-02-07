// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '../FreeMarketBase.sol';
import '../IWorkflowStep.sol';
import '../EternalStorage.sol';

/// @dev Actions will typically have an external contract that they
// interact with and it may vary by chain, so make it configurable at deploy time.
abstract contract ActionBase is FreeMarketBase {
  event ForeignAddressChanged(address oldAddress, address newAddress);

  constructor(address storageAddress, address contractAddress) FreeMarketBase(msg.sender, storageAddress, address(0), false) {}

  function getContractAddress() public view returns (address x) {
    EternalStorage store = EternalStorage(eternalStorageAddress);
    return store.getAddress(getStorageKey());
  }

  function getContractAddressConfigKey() internal pure virtual returns (string memory);

  function getStorageKey() public pure returns (bytes32) {
    return keccak256(abi.encodePacked(getContractAddressConfigKey()));
  }

  function setForeignAddress(address foreignAddress) public onlyOwner {
    EternalStorage store = EternalStorage(eternalStorageAddress);
    bytes32 storageKey = getStorageKey();
    address oldAddress = store.getAddress(storageKey);
    store.setAddress(storageKey, foreignAddress);
    emit ForeignAddressChanged(oldAddress, foreignAddress);
  }
}
