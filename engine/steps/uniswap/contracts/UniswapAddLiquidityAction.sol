// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '@freemarket/core/contracts/IWorkflowStep.sol';
import './INonfungiblePositionManager.sol';
import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import '@freemarket/step-sdk/contracts/LibErc20.sol';
import '@freemarket/step-sdk/contracts/LibWethUtils.sol';
import './AbstractUniswapAction.sol';
import './IV3SwapRouter.sol';
import '@freemarket/step-sdk/contracts/ABDKMathQuad.sol';
using ABDKMathQuad for bytes16;

using LibStepResultBuilder for StepResultBuilder;
using LibErc20 for IERC20;

/*
the fields needed to create MintParams except 
token0, token1, amount0Desired, amount1Desired which come from input assets
*/
struct UniswapAddLiquidityParams {
  uint24 fee;
  int24 tickLower;
  int24 tickUpper;
  uint256 amount0Min;
  uint256 amount1Min;
  uint256 deadline;
}

contract UniswapAddLiquidityAction is IWorkflowStep {
  address public immutable routerAddress;
  address public immutable wethAddress;

  constructor(address _routerAddress, address _wethAddress) {
    routerAddress = _routerAddress;
    wethAddress = _wethAddress;
  }

  function execute(
    AssetAmount[] calldata assetAmounts,
    bytes calldata argData,
    address
  ) external payable override returns (WorkflowStepResult memory) {
    UniswapAddLiquidityParams memory params = abi.decode(argData, (UniswapAddLiquidityParams));
    require(assetAmounts.length == 2, '2 assets');
    INonfungiblePositionManager positionManager = INonfungiblePositionManager(IV3SwapRouter(routerAddress).positionManager());

    // TODO can we allocate only 1 obj instead?
    INonfungiblePositionManager.MintParams memory mintParams = INonfungiblePositionManager.MintParams({
      token0: assetAmounts[0].asset.assetAddress,
      token1: assetAmounts[1].asset.assetAddress,
      fee: params.fee,
      tickLower: params.tickLower,
      tickUpper: params.tickUpper,
      amount0Desired: assetAmounts[0].amount,
      amount1Desired: assetAmounts[1].amount,
      amount0Min: params.amount0Min,
      amount1Min: params.amount1Min,
      recipient: address(this),
      deadline: params.deadline
    });

    //    (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1) = positionManager.mint(mintParams);
    AssetAmount memory inputAsset0;
    AssetAmount memory inputAsset1;
    inputAsset0.asset = assetAmounts[0].asset;
    inputAsset1.asset = assetAmounts[1].asset;

    // TODO add support for ERC721 with tokenId
    (, , inputAsset0.amount, inputAsset1.amount) = positionManager.mint(mintParams);

    return
      LibStepResultBuilder
        .create(2, 1)
        .addInputAssetAmount(inputAsset0)
        .addInputAssetAmount(inputAsset1)
        .addOutputAssetAmount(AssetAmount(Asset(AssetType.ERC721, address(positionManager)), 1))
        .result;
  }
}
