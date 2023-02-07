// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '../../IWorkflowStep.sol';
import '../../LibAsset.sol';
import '../../LibActionHelpers.sol';
import '../../model/Asset.sol';
import '../../model/AssetAmount.sol';
import './Weth.sol';

contract UnwrapEther is IWorkflowStep {
  address public immutable wethContractAddress;
  event EtherUnwrapped(address thisAddr, uint256 amount);

  constructor(address wrappedEtherContractAddress) {
    wethContractAddress = wrappedEtherContractAddress;
  }

  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    Asset[] calldata,
    bytes calldata
  ) external payable returns (WorkflowStepResult memory) {
    uint256 amount = inputAssetAmounts[0].amount;
    emit EtherUnwrapped(address(this), amount);
    Weth weth = Weth(wethContractAddress);
    weth.withdraw(amount);
    return LibActionHelpers.singleTokenResult(wethContractAddress, amount);
  }
}
