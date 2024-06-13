// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './LibConfigReader.sol';

/*
  inheriting FreeMarketBase doesn't add state, 
  only an immutable (in bytecode) address to eternalStorageAddress
*/

contract FreeMarketBase {
  address public immutable eternalStorageAddress;

  function _upstreamAddress() internal view returns (address) {
      return  LibConfigReader.getProxyUpstream(eternalStorageAddress);
  }

  function _isUserProxy() internal view returns (bool) {
      return  LibConfigReader.getIsUserProxy(eternalStorageAddress);
  }


  constructor(
    address eternalStorage
  ) {
    eternalStorageAddress = eternalStorage;
  }
}
