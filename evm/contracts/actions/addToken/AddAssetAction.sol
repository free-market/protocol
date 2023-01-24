// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '../../IWorkflowStep.sol';
import '../../LibAsset.sol';
import '../../LibActionHelpers.sol';
import '../../model/Asset.sol';
import '../../model/AssetAmount.sol';

struct AddAssetActionArgs {
  address userAddress;
  uint256 amount;
}

contract AddAssetAction is IWorkflowStep {
  event AssetAdded(address userAddress, AssetType assetType, address assetAddress, uint256 amount);
  event ErasemeAllowance(uint256 amount);

  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    Asset[] calldata outputAssets,
    bytes calldata data
  ) external payable returns (WorkflowStepResult memory) {
    require(inputAssetAmounts.length == 0, 'AddTokenAction must have 0 input assets');
    require(outputAssets.length == 1, 'AddTokenAction must have 1 output asset');
    require(outputAssets[0].assetType == AssetType.ERC20, 'AddTokenAction currently only supports ERC20s');
    AddAssetActionArgs memory args = abi.decode(data, (AddAssetActionArgs));
    emit AssetAdded(args.userAddress, outputAssets[0].assetType, outputAssets[0].assetAddress, args.amount);
    IERC20 erc20 = IERC20(outputAssets[0].assetAddress);

    uint256 allowance = erc20.allowance(args.userAddress, address(this));
    emit ErasemeAllowance(allowance);

    SafeERC20.safeTransferFrom(erc20, args.userAddress, address(this), args.amount);
    return LibActionHelpers.singleTokenResult(outputAssets[0].assetAddress, args.amount);
  }
}
