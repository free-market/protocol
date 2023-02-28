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
  /// @notice This event is emitted when AddAssetAction is executed
  /// @param fromAddress The address from which the asset is transferred into this workflow instance
  /// @param assetAmount The asset and amount that is transferred into this workflow instance
  event AssetAdded(address fromAddress, AssetAmount assetAmount);

  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    Asset[] calldata outputAssets,
    bytes calldata data
  ) external payable returns (WorkflowStepResult memory) {
    // validate
    require(inputAssetAmounts.length == 0, 'AddTokenAction must have 0 input assets');
    require(outputAssets.length == 1, 'AddTokenAction must have 1 output asset');
    require(outputAssets[0].assetType == AssetType.ERC20, 'AddTokenAction currently only supports ERC20s');

    // decode arguments
    AddAssetActionArgs memory args = abi.decode(data, (AddAssetActionArgs));

    emit AssetAdded(args.userAddress, AssetAmount(outputAssets[0], args.amount));

    // transfer the token to this
    IERC20 erc20 = IERC20(outputAssets[0].assetAddress);
    SafeERC20.safeTransferFrom(erc20, args.userAddress, address(this), args.amount);

    // return amount transferred
    return LibActionHelpers.singleTokenResult(outputAssets[0].assetAddress, args.amount);
  }
}
