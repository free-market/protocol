// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '../../IWorkflowStep.sol';
import '../../LibActionHelpers.sol';
import './IAaveV3Pool.sol';
import '../../model/Workflow.sol';
import '../../model/AssetAmount.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
// import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";

// StargateBridgeAction specific arguments
struct AaveSupplyActionArgs {
  // the address that will receive the aTokens
  // use addres 0 to leave the assets in the workflow engine (TODO not currently supported)
  address onBehalfOf;
}

contract AaveSupplyAction is IWorkflowStep {
  IAaveV3Pool public immutable pool;
  address public immutable aTokenAddress;

  constructor(address _aavePoolAddress, address _aTokenAddress) {
    pool = IAaveV3Pool(_aavePoolAddress);
    // TODO maybe waffle can help mock the full IPool interface, which would be need to replace IAaveV3Pool with the full IPool from @aave/core-v3
    // which would allow us to use it here to look up the aToken address at deploy time based on the pool address
    aTokenAddress = _aTokenAddress;
  }

  event AaveSupplyActionEvent(AssetAmount[] inputAssets, address onBehalfOf);

  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    Asset[] calldata outputAssets,
    bytes calldata data
  ) public payable returns (WorkflowStepResult memory) {
    // validate
    require(inputAssetAmounts.length == 1, 'there must be exactly 1 input asset');
    require(inputAssetAmounts[0].asset.assetType == AssetType.ERC20, 'the input asset must be an ERC20');

    // decode the args
    AaveSupplyActionArgs memory args = abi.decode(data, (AaveSupplyActionArgs));

    emit AaveSupplyActionEvent(inputAssetAmounts, args.onBehalfOf);

    // approve aave to take the asset
    IERC20(inputAssetAmounts[0].asset.assetAddress).approve(address(pool), inputAssetAmounts[0].amount);

    if (args.onBehalfOf == address(0)) {
      // keep the aToken in the engine
      require(outputAssets.length == 1, 'there must be exactly 1 output asset when keeping the aToken in the engine');
      // TODO get the amount (before and after to be safe, in case there is residual aTokens left from previous transactions for some reason)
      // pool.supply(inputAssetAmounts[0].asset.assetAddress, inputAssets[0].amount, address(this), 0);
      revert('not implemented');
      // return LibActionHelpers.singleTokenResult(aTokenAddress, <delta amount goes here>);
    }

    // sending the aToken to the user directly
    require(outputAssets.length == 0, 'there should be no output assets when sending the aTokens to the user directly');

    // send the output directly to the end user (or whomever)
    pool.supply(inputAssetAmounts[0].asset.assetAddress, inputAssetAmounts[0].amount, args.onBehalfOf, 0);
    return LibActionHelpers.noOutputAssetsResult();
  }
}
