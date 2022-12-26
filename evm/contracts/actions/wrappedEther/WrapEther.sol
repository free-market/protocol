// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './WrappedEtherBase.sol';
import '../../IWorkflowStep.sol';
import '../../LibAsset.sol';
import './Weth.sol';

contract WrapEther is WrappedEtherBase, IWorkflowStep {
  // contract WrapEther is IWorkflowStep {
  // contract WrapEther is WrappedEtherBase(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2), IWorkflowStep {
  constructor(address storageAddress, address wethContractAddress) WrappedEtherBase(storageAddress, wethContractAddress) {}

  function execute(
    uint256,
    uint256 amount,
    uint256[] calldata
  ) external returns (WorkflowStepResult memory) {
    return WorkflowStepResult(LibAsset.Asset(LibAsset.AssetType.Token, address(0)), amount);
    // getWeth().deposit{value: amount}();
    // return WorkflowStepResult(LibAsset.Asset(LibAsset.AssetType.Token, getContractAddress()), amount);
  }
}
