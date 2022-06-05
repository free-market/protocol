// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import './OwnableMutableProxy.sol';
import './EternalStorage.sol';

contract FrontDoor is OwnableMutableProxy {
  address public eternalStorageAddress;
  address public frontDoorAddress;

  constructor() {
    eternalStorageAddress = address(new EternalStorage());
    frontDoorAddress = address(this);
  }
}
