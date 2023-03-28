// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@freemarket/core/contracts/IWorkflowStep.sol";
import "@freemarket/step-sdk/contracts/LibActionHelpers.sol";
import "./Weth.sol";

contract WrapNativeAction is IWorkflowStep {
    address public immutable contractAddress;

    event NativeWrapped(address thisAddr, uint256 amount);

    constructor(address wrappedEtherContractAddress) {
        contractAddress = wrappedEtherContractAddress;
    }

    function execute(AssetAmount[] calldata inputAssetAmounts, Asset[] calldata, bytes calldata)
        external
        payable
        returns (WorkflowStepResult memory)
    {
        require(inputAssetAmounts.length == 1);
        uint256 amount = inputAssetAmounts[0].amount;
        emit NativeWrapped(address(this), amount);
        Weth weth = Weth(contractAddress);
        weth.deposit{value: amount}();

        return LibActionHelpers.singleTokenResult(contractAddress, amount);
    }
}
