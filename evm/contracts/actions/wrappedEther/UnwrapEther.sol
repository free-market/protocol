// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './WrappedEtherBase.sol';
import '../../IWorkflowStep.sol';
import '../../LibAsset.sol';
import './Weth.sol';

contract UnwrapEther is WrappedEtherBase, IWorkflowStep {
  constructor(address frontDoorAddress, address wethContractAddress) WrappedEtherBase(frontDoorAddress, wethContractAddress) {}

  function execute(
    uint256,
    uint256 amount,
    uint256[] calldata
  ) external returns (WorkflowStepResult memory) {
    getWeth().deposit{value: amount}();
    return WorkflowStepResult(LibAsset.Asset(LibAsset.AssetType.Token, getContractAddress()), amount);
  }
}
