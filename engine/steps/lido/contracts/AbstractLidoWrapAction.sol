// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import './IWstEth.sol';
import './AbstractLidoAction.sol';

abstract contract AbstractLidoWrapAction is AbstractLidoAction {
  IWstEth public immutable wstEth;

  struct WrapParams {
    uint minOutputAmount;
  }

  constructor(address _stEth, address _wstEth) AbstractLidoAction (_stEth) {
    wstEth = IWstEth(_wstEth);
  }

}