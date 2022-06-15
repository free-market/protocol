// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import './Proxy.sol';
import './IHasUpstream.sol';

/**
 * @dev A generic proxy contract that has an owner, and delegates all calls to an upstream contract.
 * The owner and upstream addresses are immutable.
 *
 * The use case for this is per-user contracts.  The user will be the owner, and the
 * upstream will be the proxy delegate for the main FMP logic.
 *
 * The goal here is to keep the bytecode size of this contract to a minimum to minimize
 * gas costs for the end user.
 */
contract OwnableImmutableProxy is Proxy, IHasUpstream {
  address public owner;
  address public upstream;

  constructor(address theOwner, address initialUpstream) {
    upstream = initialUpstream;
    owner = theOwner;
  }

  /// @dev this forwards all calls generically to upstream, only the owner can invoke this
  fallback() external payable {
    // enforce owner authz in upstream
    // require(owner == msg.sender);
    _delegate(upstream);
  }

  /// @dev this allows this contract to receive ETH
  receive() external payable {
    // noop
  }

  function getUpstream() external view returns (address) {
    return upstream;
  }
}
