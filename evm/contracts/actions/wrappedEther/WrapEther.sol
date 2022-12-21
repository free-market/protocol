// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import './WrappedEtherBase.sol';
import '../../IWorkflowStep.sol';
import '../../LibAsset.sol';
import './Weth.sol';

contract WrapEther is WrappedEtherBase, IWorkflowStep {
  constructor(address wethContractAddress) WrappedEtherBase(wethContractAddress) {}

  function execute(
    uint256,
    uint256 amount,
    uint256[] calldata
  ) external returns (WorkflowStepResult memory) {
    Weth weth = Weth(getContractAddress());
    weth.deposit{value: amount}();
    return WorkflowStepResult(LibAsset.Asset(LibAsset.AssetType.Token, getContractAddress()), amount);
  }
}
