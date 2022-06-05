// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import './OwnableImmutableProxy.sol';

/**
 * @dev Adds methods for mutability to OwnableImmutableProxy,
 * allowing the owner to change to a new owner, and allowing this contract
 * to point to a different upstream contract to enable upgradability
 * of the main logic contract.
 */
contract OwnableMutableProxy is OwnableImmutableProxy {
  event LogNewOwner(address sender, address newOwner);
  event LogNewUpstream(address sender, address oldUpstream, address newUpstream);

  constructor() OwnableImmutableProxy(msg.sender, address(0)) {}

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  function setUpstream(address newUpstream) public {
    address oldUpstream = upstream;
    upstream = newUpstream;
    emit LogNewUpstream(msg.sender, oldUpstream, newUpstream);
  }

  function changeOwner(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    emit LogNewOwner(msg.sender, newOwner);
  }
}
