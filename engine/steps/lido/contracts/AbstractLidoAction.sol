// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './IStEth.sol';

abstract contract AbstractLidoAction  {
  IStEth public immutable stEth;

  constructor(address _stEth) {
    stEth = IStEth(_stEth);
  }

}