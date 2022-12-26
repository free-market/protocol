// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './EternalStorage.sol';
import './Proxy.sol';

contract FrontDoor is Proxy {
  event ErasemeFrontDoorCtor(address es);

  constructor() Proxy(msg.sender, address(new EternalStorage(address(this))), address(0x0), false) {
    emit ErasemeFrontDoorCtor(eternalStorageAddress);
    EternalStorage es = EternalStorage(eternalStorageAddress);
    bytes32 key = keccak256(abi.encodePacked('frontDoor', msg.sender));
    es.setAddress(key, address(this));
  }

  event UpstreamChanged(address oldUpstream, address newUpstream);

  function setUpstream(address newUpstream) public onlyOwner {
    address oldUpstream = upstreamAddress;
    upstreamAddress = newUpstream;
    emit UpstreamChanged(oldUpstream, newUpstream);
  }
}
