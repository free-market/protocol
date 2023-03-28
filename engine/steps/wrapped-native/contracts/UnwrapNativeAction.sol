// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@freemarket/core/contracts/IWorkflowStep.sol";
import "@freemarket/step-sdk/contracts/LibActionHelpers.sol";
import "./Weth.sol";
import "@freemarket/step-sdk/contracts/LibStepResultBuilder.sol";

using LibStepResultBuilder for StepResultBuilder;

contract UnwrapNativeAction is IWorkflowStep {
    address public immutable wethContractAddress;

    event NativeUnwrapped(address thisAddr, uint256 amount);

    constructor(address wrappedEtherContractAddress) {
        wethContractAddress = wrappedEtherContractAddress;
    }

    function execute(AssetAmount[] calldata inputAssetAmounts, Asset[] calldata, bytes calldata)
        external
        payable
        returns (WorkflowStepResult memory)
    {
        uint256 amount = inputAssetAmounts[0].amount;
        emit NativeUnwrapped(address(this), amount);
        Weth weth = Weth(wethContractAddress);
        weth.withdraw(amount);
        return
            LibStepResultBuilder.create(1, 1).addInputNative(amount).addOutputToken(wethContractAddress, amount).result;
    }
}
