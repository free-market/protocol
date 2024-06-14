// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './LibConfigReader.sol';

/*
  inheriting FreeMarketBase doesn't add state, 
  only an immutable (in bytecode) address to eternalStorageAddress
*/

contract FreeMarketBase {
  address public immutable eternalStorageAddress;

  constructor(
    address eternalStorage
  ) {
    eternalStorageAddress = eternalStorage;
  }
}
