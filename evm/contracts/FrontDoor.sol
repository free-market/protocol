// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './EternalStorage.sol';
import './Proxy.sol';

contract FrontDoor is Proxy {
  constructor() Proxy(msg.sender, address(new EternalStorage()), address(0x0), false) {}

  event UpstreamChanged(address oldUpstream, address newUpstream);

  function setUpstream(address newUpstream) public onlyOwner {
    address oldUpstream = upstreamAddress;
    upstreamAddress = newUpstream;
    emit UpstreamChanged(oldUpstream, newUpstream);
  }
}
