// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.13;

import './IStargateRouter.sol';

contract MockStargateRouter is IStargateRouter {
  struct MockStargateRouterSwapArgs {
    uint16 dstChainId;
    uint256 srcPoolId;
    uint256 dstPoolId;
    address payable refundAddress;
    uint256 amount;
    uint256 minAmountOut;
    bytes to;
    lzTxObj lzTxParams;
    bytes payload;
  }

  MockStargateRouterSwapArgs[] internal swapInvocations;

  function getSwapInvocations() public view returns (MockStargateRouterSwapArgs[] memory) {
    return swapInvocations;
  }

  function getSwapInvocationAt(uint256 i) public view returns (MockStargateRouterSwapArgs memory) {
    return swapInvocations[i];
  }

  function getSwapInvocationCount() public view returns (uint256) {
    return swapInvocations.length;
  }

  function clear() public {
    while (swapInvocations.length > 0) {
      swapInvocations.pop();
    }
  }

  function addLiquidity(
    uint256 _poolId,
    uint256 _amountLD,
    address _to
  ) external {}

  function swap(
    uint16 _dstChainId,
    uint256 _srcPoolId,
    uint256 _dstPoolId,
    address payable _refundAddress,
    uint256 _amountLD,
    uint256 _minAmountLD,
    lzTxObj memory _lzTxParams,
    bytes calldata _to,
    bytes calldata _payload
  ) external payable {
    swapInvocations.push(
      MockStargateRouterSwapArgs(_dstChainId, _srcPoolId, _dstPoolId, _refundAddress, _amountLD, _minAmountLD, _to, _lzTxParams, _payload)
    );
  }

  function redeemRemote(
    uint16 _dstChainId,
    uint256 _srcPoolId,
    uint256 _dstPoolId,
    address payable _refundAddress,
    uint256 _amountLP,
    uint256 _minAmountLD,
    bytes calldata _to,
    lzTxObj memory _lzTxParams
  ) external payable {}

  function instantRedeemLocal(
    uint16,
    uint256,
    address
  ) external pure returns (uint256) {
    return 0;
  }

  function redeemLocal(
    uint16 _dstChainId,
    uint256 _srcPoolId,
    uint256 _dstPoolId,
    address payable _refundAddress,
    uint256 _amountLP,
    bytes calldata _to,
    lzTxObj memory _lzTxParams
  ) external payable {}

  function sendCredits(
    uint16 _dstChainId,
    uint256 _srcPoolId,
    uint256 _dstPoolId,
    address payable _refundAddress
  ) external payable {}

  function quoteLayerZeroFee(
    uint16,
    uint8,
    bytes calldata,
    bytes calldata,
    lzTxObj memory
  ) external pure returns (uint256, uint256) {
    return (0, 0);
  }

  function factory() external pure returns (address) {
    return address(0);
  }
}
