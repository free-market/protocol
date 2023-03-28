// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@freemarket/core/contracts/IWorkflowStep.sol";
import "@freemarket/step-sdk/contracts/LibActionHelpers.sol";
import "@freemarket/core/contracts/model/AssetAmount.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@freemarket/step-sdk/contracts/LibStepResultBuilder.sol";

using LibStepResultBuilder for StepResultBuilder;
using SafeERC20 for IERC20;

import {ITriCrypto2} from "./ITriCrypto2.sol";

struct CurveTriCryptoSwapArgs {
    uint256 fromIndex;
    uint256 toIndex;
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

    function execute(AssetAmount[] calldata inputAssetAmounts, Asset[] calldata outputAssets, bytes calldata)
        public
        payable
        returns (WorkflowStepResult memory)
    {
        // validate
        require(inputAssetAmounts.length == 1, "there must be exactly 1 input asset");
        require(outputAssets.length == 1, "there must be exactly 1 output asset");

        Locals memory locals;
        locals.useNative = false;

        locals.inputTokenAddress = inputAssetAmounts[0].asset.assetAddress;
        locals.outputTokenAddress = outputAssets[0].assetAddress;
        if (inputAssetAmounts[0].asset.assetType == AssetType.Native) {
            locals.inputTokenAddress = coin2;
            locals.i = 2;
            locals.useNative = true;
            locals.nativeInputAmount = inputAssetAmounts[0].amount;
        } else {
            locals.inputTokenAddress = inputAssetAmounts[0].asset.assetAddress;
            IERC20(locals.inputTokenAddress).safeApprove(triCryptoAddress, inputAssetAmounts[0].amount);
            locals.i = getTokenIndex(locals.inputTokenAddress);
        }

        if (outputAssets[0].assetType == AssetType.Native) {
            locals.outputTokenAddress = coin2;
            locals.useNative = true;
            locals.j = 2;
            locals.outputAmountBefore = address(this).balance;
        } else {
            locals.outputTokenAddress = outputAssets[0].assetAddress;
            locals.j = getTokenIndex(locals.outputTokenAddress);
            locals.outputAmountBefore = IERC20(locals.outputTokenAddress).balanceOf(address(this));
        }

        emit TriCryptoSwap2Event(
            locals.inputTokenAddress, locals.outputTokenAddress, inputAssetAmounts[0].amount, locals.useNative
            );

        // TODO allow user to provide minOut as absolute or relative

        // do the swap
        ITriCrypto2(triCryptoAddress).exchange{value: locals.nativeInputAmount}(
            locals.i, locals.j, inputAssetAmounts[0].amount, 1, locals.useNative
        );

        // deal with output
        if (outputAssets[0].assetType == AssetType.Native) {
            locals.outputAmountAfter = address(this).balance;
        } else {
            locals.outputAmountAfter = IERC20(locals.outputTokenAddress).balanceOf(address(this));
        }
        locals.outputAmountDelta = locals.outputAmountAfter - locals.outputAmountBefore;
        require(locals.outputAmountDelta > 0, "output balance did not increase");

        return LibStepResultBuilder.create(1, 1).addInputAssetAmount(inputAssetAmounts[0]).addOutputToken(
            locals.outputTokenAddress, locals.outputAmountDelta
        ).result;
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
        revert("unknown token address");
    }
}
