// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/core/contracts/model/AssetAmount.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import '@freemarket/step-sdk/contracts/LibErc20.sol';

import 'hardhat/console.sol';

using LibStepResultBuilder for StepResultBuilder;
using LibErc20 for IERC20;

import {ITriCrypto2} from './ITriCrypto2.sol';

struct CurveTriCryptoSwapParams {
  Asset toAsset;
}

contract CurveTriCrypto2SwapAction is IWorkflowStep {
  event TriCryptoSwap2Event(address from, address to, uint256 amount, bool useNative);

  address public immutable triCryptoAddress;
  address public immutable coin0;
  address public immutable coin1;
  address public immutable coin2;

  constructor(address _triCryptoAddress) {
    triCryptoAddress = _triCryptoAddress;
    ITriCrypto2 iTriCrypto = ITriCrypto2(triCryptoAddress);
    coin0 = iTriCrypto.coins(0);
    coin1 = iTriCrypto.coins(1);
    coin2 = iTriCrypto.coins(2);
  }

  struct Locals {
    address inputTokenAddress;
    address outputTokenAddress;
    uint256 i;
    uint256 j;
    IERC20 outputToken;
    uint256 outputAmountBefore;
    uint256 outputAmountAfter;
    uint256 outputAmountDelta;
    bool useNative;
    uint256 nativeInputAmount;
  }

  function execute(
    AssetAmount[] calldata assetAmounts,
    bytes calldata argData,
    address
  ) public payable returns (WorkflowStepResult memory) {
    // validate
    require(assetAmounts.length == 1, 'there must be exactly 1 input asset');

    // decode arguments
    CurveTriCryptoSwapParams memory args = abi.decode(argData, (CurveTriCryptoSwapParams));

    Locals memory locals;
    locals.useNative = false;

    locals.inputTokenAddress = assetAmounts[0].asset.assetAddress;
    locals.outputTokenAddress = args.toAsset.assetAddress;
    if (assetAmounts[0].asset.assetType == AssetType.Native) {
      locals.inputTokenAddress = coin2;
      locals.i = 2;
      locals.useNative = true;
      locals.nativeInputAmount = assetAmounts[0].amount;
    } else {
      locals.inputTokenAddress = assetAmounts[0].asset.assetAddress;
      IERC20(locals.inputTokenAddress).safeApprove(triCryptoAddress, assetAmounts[0].amount);
      locals.i = getTokenIndex(locals.inputTokenAddress);
    }

    if (args.toAsset.assetType == AssetType.Native) {
      locals.outputTokenAddress = coin2;
      locals.useNative = true;
      locals.j = 2;
      locals.outputAmountBefore = address(this).balance;
    } else {
      locals.outputTokenAddress = args.toAsset.assetAddress;
      locals.j = getTokenIndex(locals.outputTokenAddress);
      locals.outputAmountBefore = IERC20(locals.outputTokenAddress).balanceOf(address(this));
    }

    emit TriCryptoSwap2Event(locals.inputTokenAddress, locals.outputTokenAddress, assetAmounts[0].amount, locals.useNative);

    // TODO allow user to provide minOut as absolute or relative

    console.log('i', locals.i);
    console.log('j', locals.j);
    console.log('amount', assetAmounts[0].amount);
    console.log('useNative', locals.useNative);

    // do the swap
    ITriCrypto2(triCryptoAddress).exchange{value: locals.nativeInputAmount}(
      locals.i,
      locals.j,
      assetAmounts[0].amount,
      1,
      locals.useNative
    );

    // deal with output
    if (args.toAsset.assetType == AssetType.Native) {
      locals.outputAmountAfter = address(this).balance;
    } else {
      locals.outputAmountAfter = IERC20(locals.outputTokenAddress).balanceOf(address(this));
    }
    locals.outputAmountDelta = locals.outputAmountAfter - locals.outputAmountBefore;
    require(locals.outputAmountDelta > 0, 'output balance did not increase');

    return
      LibStepResultBuilder
        .create(1, 1)
        .addInputAssetAmount(assetAmounts[0])
        .addOutputToken(locals.outputTokenAddress, locals.outputAmountDelta)
        .result;
    // return WorkflowStepResult(new AssetAmount[](0), new AssetAmount[](0), -2);
  }

  function getTokenIndex(address tokenAddress) internal view returns (uint256) {
    if (tokenAddress == coin0) {
      return 0;
    }
    if (tokenAddress == coin1) {
      return 1;
    }
    if (tokenAddress == coin2) {
      return 2;
    }
    revert('unknown token address');
  }
}
