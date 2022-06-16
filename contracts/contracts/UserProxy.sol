// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import './Proxy.sol';
import './IHasUpstream.sol';

contract UserProxy is Proxy {
  address payable public owner;
  address public upstream;

  constructor(address payable theOwner, address initialUpstream) {
    // constructor() {
    upstream = initialUpstream;
    owner = theOwner;
  }

  /// @dev this forwards all calls generically to upstream, only the owner can invoke this
  fallback() external payable {
    require(owner == msg.sender);
    address myUpsteam = upstream;
    address myUpstreamsUpstream = IHasUpstream(myUpsteam).getUpstream();
    // _delegate(IHasUpstream(upstream).getUpstream());
    _delegate(myUpstreamsUpstream);
  }

  /// @dev this allows this contract to receive ETH
  receive() external payable {
    // noop
  }
}
