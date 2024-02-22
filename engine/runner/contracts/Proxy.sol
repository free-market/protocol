// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import './IHasUpstream.sol';
import './FreeMarketBase.sol';
import './EternalStorage.sol';
import 'hardhat/console.sol';

contract Proxy is FreeMarketBase, IHasUpstream {
  bytes32 constant runnerAddresses = 0x32b7d36eef9191cec628a9b46ddda74b702cf693ad48a065f3f9e5fcc4ea08f5; // keccak256('runnerAddresses')

  constructor(
    address owner,
    address storageAddress,
    address upstream,
    bool userProxy
  ) FreeMarketBase(owner, storageAddress, upstream, userProxy) {}

  function getUpstream() external view virtual returns (address) {
    return upstreamAddress;
  }

  function resolveUpstream() internal view returns (address addr) {
    address upstreamFromArgs = getAddressFromCalldata();
    console.log('upstreamFromArgs', upstreamFromArgs);
    if (upstreamFromArgs != address(0)) {
      EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
      require(eternalStorage.containsEnumerableMapAddressToUint(runnerAddresses, upstreamFromArgs), 'provided upstream not whitelisted');
      return upstreamFromArgs;
    }
    return upstreamAddress;
  }

  function getAddressFromCalldata() internal pure returns (address addr) {
    assembly {
      let offset := add(4, calldataload(4))
      addr := calldataload(offset)
    }
  }

  /// @dev this forwards all calls generically to upstream, only the owner can invoke this
  fallback() external payable {
    address upstream = resolveUpstream();
    _delegate(upstream);
  }

  /// @dev this allows this contract to receive ETH
  receive() external payable {
    // noop
  }

  /**
   * @dev Delegates execution to an implementation contract.
   * This is a low level function that doesn't return to its internal call site.
   * It will return to the external caller whatever the implementation returns.
   */
  function _delegate(address upstr) internal {
    assembly {
      // Copy msg.data. We take full control of memory in this inline assembly
      // block because it will not return to Solidity code. We overwrite the
      // Solidity scratch pad at memory position 0.
      calldatacopy(0, 0, calldatasize())
      // Call the implementation.
      // out and outsize are 0 because we don't know the size yet.
      let result := delegatecall(gas(), upstr, 0, calldatasize(), 0, 0)
      // Copy the returned data.
      returndatacopy(0, 0, returndatasize())
      switch result
      // delegatecall returns 0 on error.
      case 0 {
        revert(0, returndatasize())
      }
      default {
        return(0, returndatasize())
      }
    }
  }
}
