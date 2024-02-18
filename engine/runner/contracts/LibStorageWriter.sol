// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import {EternalStorage} from './EternalStorage.sol';

library StorageWriter {
  // *** Setter Methods ***
  function setUint(address storageAddr, bytes32 key, uint256 value) internal {
    (bool success, bytes memory returnData) = storageAddr.delegatecall(abi.encodeCall(EternalStorage.setUint, (key, value)));
    require(success, string(returnData));
  }

  function setString(address storageAddr, bytes32 key, string memory value) internal {
    (bool success, bytes memory returnData) = storageAddr.delegatecall(abi.encodeCall(EternalStorage.setString, (key, value)));
    require(success, string(returnData));
  }

  function setAddress(address storageAddr, bytes32 key, address value) internal {
    (bool success, bytes memory returnData) = storageAddr.delegatecall(abi.encodeCall(EternalStorage.setAddress, (key, value)));
    require(success, string(returnData));
  }

  function setBytes(address storageAddr, bytes32 key, bytes memory value) internal {
    (bool success, bytes memory returnData) = storageAddr.delegatecall(abi.encodeCall(EternalStorage.setBytes, (key, value)));
    require(success, string(returnData));
  }

  function setBool(address storageAddr, bytes32 key, bool value) internal {
    (bool success, bytes memory returnData) = storageAddr.delegatecall(abi.encodeCall(EternalStorage.setBool, (key, value)));
    require(success, string(returnData));
  }

  function setInt(address storageAddr, bytes32 key, int256 value) internal {
    (bool success, bytes memory returnData) = storageAddr.delegatecall(abi.encodeCall(EternalStorage.setInt, (key, value)));
    require(success, string(returnData));
  }
}
