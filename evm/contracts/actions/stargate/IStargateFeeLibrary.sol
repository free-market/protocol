// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.13;

struct SwapObj {
  uint256 amount;
  uint256 eqFee;
  uint256 eqReward;
  uint256 lpFee;
  uint256 protocolFee;
  uint256 lkbRemove;
}

interface IStargateFeeLibrary {
  function getFees(
    uint256 _srcPoolId,
    uint256 _dstPoolId,
    uint16 _dstChainId,
    address _from,
    uint256 _amountSD
  ) external view returns (SwapObj memory);

  function getVersion() external view returns (string memory);
}
