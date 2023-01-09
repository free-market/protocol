// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '../../IWorkflowStep.sol';
import '../../LibAsset.sol';
import '../../LibActionHelpers.sol';
import '../../model/Asset.sol';
import '../../model/AssetAmount.sol';

struct StargateBridgeParams {
  uint16 targetChainId;
  uint256 originPoolId;
  uint256 targetPoolId;
  uint256 destGas;
  uint256 destAirDrop;
  bytes destWorkflow;
}

contract StargateBridge is IWorkflowStep {
  address public immutable wethContractAddress;
  event StargateBridgeEvent(address thisAddr, uint256 amount);

  constructor(address wrappedEtherContractAddress) {
    wethContractAddress = wrappedEtherContractAddress;
  }

  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    Asset[] calldata,
    bytes calldata
  ) external payable returns (WorkflowStepResult memory) {
    // require(inputAssetAmounts.length == 1);
    uint256 amount = inputAssetAmounts[0].amount;
    emit StargateBridgeEvent(address(this), amount);

    //

    return LibActionHelpers.noOutputAssetsResult();
  }
}
