// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './EternalStorage.sol';
import './Proxy.sol';

contract FrontDoor is Proxy {
  constructor() Proxy(address(new EternalStorage(msg.sender, address(0)))) {}
}
