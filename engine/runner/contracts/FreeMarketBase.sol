// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './Ownable.sol';
import './LibConfigReader.sol';

contract FreeMarketBase is Ownable {
  // TODO create getters
  address public immutable eternalStorageAddress;

  function upstreamAddress() public view returns (address) {
      return  LibConfigReader.getProxyUpstream(eternalStorageAddress);
  }

  function isUserProxy() public view returns (bool) {
      return  LibConfigReader.getIsUserProxy(eternalStorageAddress);
  }


  constructor(
    address owner,
    address eternalStorage
  ) Ownable(owner) {
    eternalStorageAddress = eternalStorage;
  }
}
