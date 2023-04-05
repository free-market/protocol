// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@freemarket/core/contracts/IWorkflowStep.sol";
import "@freemarket/step-sdk/contracts/LibActionHelpers.sol";
import "@freemarket/core/contracts/model/AssetAmount.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "hardhat/console.sol";

import "@freemarket/step-sdk/contracts/LibStepResultBuilder.sol";
import "@freemarket/step-sdk/contracts/LibErc20.sol";
import "@freemarket/step-sdk/contracts/ABDKMathQuad.sol";
import "./IV3SwapRouter.sol";

using ABDKMathQuad for bytes16;
using LibStepResultBuilder for StepResultBuilder;
using LibErc20 for IERC20;

struct UniswapRoute {
    bytes encodedPath;
    int256 portion; // like percent but already divided by 100
        // uint256 minExchangeRate;
}

struct UniswapExactInActionParams {
    Asset toAsset;
    UniswapRoute[] routes;
    int256 minExchangeRate;
}

contract UniswapExactInAction is IWorkflowStep {
    event UniswapExactInActionEvent(address from, address to, uint256 amount, bool useNative);

    address public immutable routerAddress;

    constructor(address _routerAddress) {
        routerAddress = _routerAddress;
    }

    // struct Locals {}

    function execute(AssetAmount[] calldata inputAssetAmounts, bytes calldata argData)
        public
        payable
        returns (WorkflowStepResult memory)
    {
        console.log("omg I'm in the uniswap action");
        // validate
        require(inputAssetAmounts.length == 1, "there must be exactly 1 input asset");

        // Locals memory locals;
        IERC20 inputAsset = IERC20(inputAssetAmounts[0].asset.assetAddress);
        inputAsset.safeApprove(routerAddress, inputAssetAmounts[0].amount);

        UniswapExactInActionParams memory args = abi.decode(argData, (UniswapExactInActionParams));

        // logArgs(args);

        IERC20 outputAsset = IERC20(args.toAsset.assetAddress);
        uint256 outputAssetBalanceBefore = outputAsset.balanceOf(address(this));
        console.log("outputAssetBalanceBefore", outputAssetBalanceBefore);

        uint256 amountRemaining = inputAssetAmounts[0].amount;
        bytes16 amountInFloat = ABDKMathQuad.fromUInt(inputAssetAmounts[0].amount);
        console.log("routes", args.routes.length);

        for (uint256 i = 0; i < args.routes.length; i++) {
            console.log("route", i);
            console.log("  input balance  ", inputAsset.balanceOf(address(this)));
            console.log("  output balance ", outputAsset.balanceOf(address(this)));

            UniswapRoute memory route = args.routes[i];
            bytes16 portion = ABDKMathQuad.from128x128(route.portion);
            uint256 amount;
            // if this is the last route, use the remaining amount to avoid rounding errors
            if (i < args.routes.length - 1) {
                amount = portion.mul(amountInFloat).toUInt();
                console.log("  amount computed from portion", amount);
            } else {
                amount = amountRemaining;
                console.log("  amount computed from remaining", amount);
            }
            // minAmoutOut is zero because we're doing it ourself after all routes have been executed
            IV3SwapRouter.ExactInputParams memory routerArgs =
                IV3SwapRouter.ExactInputParams(route.encodedPath, address(this), amount, 0);
            IV3SwapRouter(routerAddress).exactInput(routerArgs);
            amountRemaining -= amount;
        }

        // check the amount received vs minExchangeRate
        uint256 outputAssetBalanceAfter = outputAsset.balanceOf(address(this));
        console.log("this address", address(this));
        console.log("outputAsset address", address(outputAsset));
        console.log("outputAssetBalanceAfter", outputAssetBalanceAfter);
        // bytes16 minExchangRate = ABDKMathQuad.from128x128(args.minExchangeRate);
        // bytes16 amountOutMinimum = minExchangRate.mul(amountInFloat);
        // bytes16 actualAmountOut = ABDKMathQuad.fromUInt(outputAssetBalanceAfter - outputAssetBalanceBefore);
        // int8 compareResult = actualAmountOut.cmp(amountOutMinimum);
        // require(compareResult >= 0, "amount received is less than minExchangeRate");

        return LibStepResultBuilder.create(0, 0).result;
    }

    function logArgs(UniswapExactInActionParams memory args) internal view {
        console.log("toAsset address", args.toAsset.assetAddress);
        console.log("minExchangeRate", uint256(args.minExchangeRate));
        for (uint256 i = 0; i < args.routes.length; i++) {
            console.log("  route", i);
            // console.log("  encodedPath", args.routes[i].encodedPath);
            console.log("  portion", uint256(args.routes[i].portion));
        }
    }
}
