// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '../../IWorkflowStep.sol';
import '../../LibAsset.sol';
import './Weth.sol';

contract WrapEther is IWorkflowStep {
  address public immutable wethContractAddress;

  constructor(address contractAddress) {
    wethContractAddress = contractAddress;
  }

  function execute(
    uint256,
    uint256 amount,
    uint256[] calldata
  ) external returns (WorkflowStepResult memory) {
    Weth weth = Weth(wethContractAddress);
    weth.deposit{value: amount}();
    return WorkflowStepResult(LibAsset.Asset(LibAsset.AssetType.Token, wethContractAddress), amount);
  }
}
