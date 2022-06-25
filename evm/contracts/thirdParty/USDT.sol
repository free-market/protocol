// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// USDT has a slightly non-standard signature for approve
interface UsdtApprove {
  function approve(address _spender, uint256 _value) external;
}
