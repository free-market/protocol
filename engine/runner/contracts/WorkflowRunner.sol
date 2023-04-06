// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "@freemarket/core/contracts/model/Workflow.sol";
import "@freemarket/core/contracts/IWorkflowStep.sol";
import "@freemarket/core/contracts/LibPercent.sol";
import "@freemarket/core/contracts/IWorkflowRunner.sol";
import "./FrontDoor.sol";
import "./IStepManager.sol";
import "./LibAssetBalances.sol";
import "./LibStorageWriter.sol";
import "./EternalStorage.sol";
import "./LibAsset.sol";
import "./ChainBranch.sol";
import "./AssetBalanceBranch.sol";
import "hardhat/console.sol";

uint16 constant STEP_TYPE_ID_CHAIN_BRANCH = 1;
uint16 constant STEP_TYPE_ID_ASSET_AMOUNT_BRANCH = 2;

contract WorkflowRunner is FreeMarketBase, ReentrancyGuard, IWorkflowRunner, /*IUserProxyManager,*/ IStepManager {
    constructor(address payable frontDoorAddress)
        FreeMarketBase(
            msg.sender, // owner
            FrontDoor(frontDoorAddress).eternalStorageAddress(), // eternal storage address
            address(0), // upstream (this doesn't have one)
            false // isUserProxy
        )
    {}

    // latestStepAddresses maps stepTypeId to latest and greatest version of that step
    bytes32 constant latestStepAddresses = 0xc94d198e6194ea38dbd900920351d7f8e6c6d85b1d3b803fb93c54be008e11fd; // keccak256('latestActionAddresses')

    event StepAddressSetEvent(uint16 stepTypeId, address stepAddress);

    function getStepWhitelistKey(uint16 stepTypeId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("stepWhiteList", stepTypeId));
    }

    function getStepBlacklistKey(uint16 stepTypeId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("stepBlackList", stepTypeId));
    }

    function setStepAddress(uint16 stepTypeId, address stepAddress) external onlyOwner {
        EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
        eternalStorage.setEnumerableMapUintToAddress(latestStepAddresses, stepTypeId, stepAddress);
        // using the white list map like a set, we only care about the keys
        eternalStorage.setEnumerableMapAddressToUint(getStepWhitelistKey(stepTypeId), stepAddress, 0);
        eternalStorage.removeEnumerableMapAddressToUint(getStepBlacklistKey(stepTypeId), stepAddress);
        emit StepAddressSetEvent(stepTypeId, stepAddress);
    }

    function removeStepAddress(uint16 stepTypeId, address stepAddress) external onlyOwner {
        EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
        address latest = eternalStorage.getEnumerableMapUintToAddress(latestStepAddresses, stepTypeId);
        require(stepAddress != latest, "cannot remove latest step address");
        eternalStorage.setEnumerableMapAddressToUint(getStepBlacklistKey(stepTypeId), stepAddress, 0);
        eternalStorage.removeEnumerableMapAddressToUint(getStepWhitelistKey(stepTypeId), stepAddress);
        emit StepAddressSetEvent(stepTypeId, stepAddress);
    }

    function getStepAddress(uint16 stepTypeId) external view returns (address) {
        EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
        return eternalStorage.getEnumerableMapUintToAddress(latestStepAddresses, stepTypeId);
    }

    function getStepAddressInternal(uint16 stepTypeId) internal view returns (address) {
        EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
        return eternalStorage.getEnumerableMapUintToAddress(latestStepAddresses, stepTypeId);
    }

    function getStepCount() external view returns (uint256) {
        EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
        return eternalStorage.lengthEnumerableMapUintToAddress(latestStepAddresses);
    }

    function getStepInfoAt(uint256 index) public view returns (StepInfo memory) {
        EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
        (uint256 stepTypeId, address stepAddress) =
            eternalStorage.atEnumerableMapUintToAddress(latestStepAddresses, index);

        bytes32 whitelistKey = getStepWhitelistKey(uint16(stepTypeId));
        uint256 whitelistCount = eternalStorage.lengthEnumerableMapAddressToUint(whitelistKey);
        address[] memory whitelist = new address[](whitelistCount);
        for (uint256 i = 0; i < whitelistCount; ++i) {
            (address whitelistedAddress,) = eternalStorage.atEnumerableMapAddressToUint(whitelistKey, i);
            whitelist[i] = whitelistedAddress;
        }

        bytes32 blacklistKey = getStepBlacklistKey(uint16(stepTypeId));
        uint256 blacklistCount = eternalStorage.lengthEnumerableMapAddressToUint(blacklistKey);
        address[] memory blacklist = new address[](blacklistCount);
        for (uint256 i = 0; i < blacklistCount; ++i) {
            (address blacklistedAddress,) = eternalStorage.atEnumerableMapAddressToUint(blacklistKey, i);
            blacklist[i] = blacklistedAddress;
        }

        return StepInfo(uint16(stepTypeId), stepAddress, whitelist, blacklist);
    }

    /// @notice This event is emitted when a workflow execution begins.
    /// @param userAddress The user for which this workflow is executing.
    /// @param workflow The workflow.
    event WorkflowExecution(address userAddress, Workflow workflow);

    /// @notice This event is emitted when immediately after invoking a step in the workflow.
    /// @param stepIndex The index of the step in the Workflow.steps array.
    /// @param step The step configuration.
    /// @param stepTypeId The logical id of the step (also repeated in the step param but duplicated here for convenience).
    /// @param stepAddress The address of the step used for this invocation.
    /// @param inputAssetAmounts The input assets, with the absolute amount of each asset.
    /// @param result The result returned form the step invocation.
    event WorkflowStepExecution(
        uint16 stepIndex,
        WorkflowStep step,
        uint16 stepTypeId,
        address stepAddress,
        AssetAmount[] inputAssetAmounts,
        WorkflowStepResult result
    );

    /// @notice This event is emitted after the workflow has completed, once for each asset ramining with a non-zero amount.
    /// @param asset The asset.
    /// @param totalAmount The total amount of the asset.
    /// @param feeAmount The portion of the total amount that FMP will keep as a fee.
    /// @param userAmount The portion of the total amount that is sent to the user.
    event RemainingAsset(Asset asset, uint256 totalAmount, uint256 feeAmount, uint256 userAmount);

    /// @notice This event is emitted when this is a continuation of a workflow from another chain
    /// @param nonce The nonce provided by the caller on the source chain, used to correlate the source chain workflow segment with this segment.
    /// @param startingAsset The asset that was transferred from the source chain to this chain
    event WorkflowContinuation(uint256 nonce, address userAddress, AssetAmount startingAsset);

    using LibAssetBalances for LibAssetBalances.AssetBalances;

    function executeWorkflow(Workflow calldata workflow) external payable nonReentrant {
        AssetAmount memory startingAssets = AssetAmount(Asset(AssetType.Native, address(0)), 0);
        executeWorkflow(msg.sender, workflow, startingAssets);
    }

    function executeWorkflow(address userAddress, Workflow memory workflow, AssetAmount memory startingAsset)
        internal
    {
        emit WorkflowExecution(userAddress, workflow);
        // workflow starts on the step with index 0
        uint16 currentStepIndex = 0;
        // keep track of asset balances
        LibAssetBalances.AssetBalances memory assetBalances;
        // credit ETH if sent with this call
        if (msg.value != 0) {
            // TODO add event
            console.log("crediting native", msg.value);
            assetBalances.credit(0, msg.value);
        }
        // credit any starting assets (if this is a continutation workflow with assets sent by a bridge)
        if (startingAsset.amount > 0) {
            assetBalances.credit(startingAsset.asset, startingAsset.amount);
        }
        while (true) {
            // prepare to invoke the step
            WorkflowStep memory currentStep = workflow.steps[currentStepIndex];

            // ChainBranch and AssetAmountBranch are special
            if (
                currentStep.stepTypeId == STEP_TYPE_ID_CHAIN_BRANCH
                    || currentStep.stepTypeId == STEP_TYPE_ID_ASSET_AMOUNT_BRANCH
            ) {
                int16 nextStepIndex;
                if (currentStep.stepTypeId == STEP_TYPE_ID_CHAIN_BRANCH) {
                    nextStepIndex = ChainBranch.getNextStepIndex(currentStep);
                } else {
                    nextStepIndex = AssetBalanceBranch.getNextStepIndex(currentStep, assetBalances);
                }
                if (nextStepIndex == -1) {
                    break;
                }
                currentStepIndex = uint16(nextStepIndex);
                continue;
            }

            address stepAddress = resolveStepAddress(currentStep);
            AssetAmount[] memory inputAssetAmounts = resolveAmounts(assetBalances, currentStep.inputAssets);

            console.log("calling id", currentStep.stepTypeId);
            console.log("calling addr", stepAddress);
            console.log("assetAmounts", inputAssetAmounts.length);
            for (uint256 i = 0; i < inputAssetAmounts.length; ++i) {
                console.log(
                    "  input type", inputAssetAmounts[i].asset.assetType == AssetType.ERC20 ? "erc20" : "native"
                );
                console.log("  input addr", inputAssetAmounts[i].asset.assetAddress);
                console.log("  input amount", inputAssetAmounts[i].amount);
            }

            // invoke the step
            WorkflowStepResult memory stepResult = invokeStep(stepAddress, inputAssetAmounts, currentStep.argData);

            console.log("stepResult.ouptputs", stepResult.outputAssetAmounts.length);
            for (uint256 i = 0; i < stepResult.outputAssetAmounts.length; ++i) {
                console.log("output amount", stepResult.outputAssetAmounts[i].amount);
            }

            emit WorkflowStepExecution(
                currentStepIndex, currentStep, currentStep.stepTypeId, stepAddress, inputAssetAmounts, stepResult
                );

            // debit input assets
            console.log("result inputs", stepResult.inputAssetAmounts.length);
            for (uint256 i = 0; i < stepResult.inputAssetAmounts.length; ++i) {
                console.log("  debit", i);
                console.log("  debit addr", stepResult.inputAssetAmounts[i].asset.assetAddress);
                console.log("  debit amt", stepResult.inputAssetAmounts[i].amount);
                assetBalances.debit(stepResult.inputAssetAmounts[i].asset, stepResult.inputAssetAmounts[i].amount);
            }
            // credit output assets
            console.log("result outputs", stepResult.outputAssetAmounts.length);
            for (uint256 i = 0; i < stepResult.outputAssetAmounts.length; ++i) {
                console.log("  credit", i);
                console.log("  credit addr", stepResult.outputAssetAmounts[i].asset.assetAddress);
                console.log("  credit amt", stepResult.outputAssetAmounts[i].amount);
                assetBalances.credit(stepResult.outputAssetAmounts[i].asset, stepResult.outputAssetAmounts[i].amount);
            }
            console.log("currentStep.nextStepIndex");
            console.logInt(currentStep.nextStepIndex);
            if (currentStep.nextStepIndex == -1) {
                break;
            }
            currentStepIndex = uint16(currentStep.nextStepIndex);
        }
        refundUser(userAddress, assetBalances);
    }

    function refundUser(address userAddress, LibAssetBalances.AssetBalances memory assetBalances) internal {
        console.log("entering refundUser, numAssets", assetBalances.getAssetCount());
        for (uint8 i = 0; i < assetBalances.getAssetCount(); ++i) {
            AssetAmount memory ab = assetBalances.getAssetAt(i);
            console.log("  refunding asset", i);
            console.log("  refunding asset addr", ab.asset.assetAddress);
            console.log("  refunding asset amt", ab.amount);
            Asset memory asset = ab.asset;
            uint256 feeAmount = LibPercent.percentageOf(ab.amount, 300);
            uint256 userAmount = ab.amount - feeAmount;
            emit RemainingAsset(asset, ab.amount, feeAmount, userAmount);
            if (asset.assetType == AssetType.Native) {
                // TODO this needs a unit test
                require(address(this).balance >= ab.amount, "computed native balance is greater than actual balance");
                (bool sent, bytes memory data) = payable(userAddress).call{value: userAmount}("");
                require(sent, string(data));
            } else if (asset.assetType == AssetType.ERC20) {
                IERC20 token = IERC20(asset.assetAddress);
                uint256 balance = token.balanceOf(address(this));
                console.log("  refunding erc20 balance", balance);
                SafeERC20.safeTransfer(token, userAddress, userAmount);
            } else {
                revert("unknown asset type in assetBalances");
            }
        }
    }

    function invokeStep(address stepAddress, AssetAmount[] memory inputAssetAmounts, bytes memory data)
        internal
        returns (WorkflowStepResult memory)
    {
        (bool success, bytes memory returnData) =
            stepAddress.delegatecall(abi.encodeWithSelector(IWorkflowStep.execute.selector, inputAssetAmounts, data));
        require(success, string(returnData));
        return abi.decode(returnData, (WorkflowStepResult));
    }

    function resolveStepAddress(WorkflowStep memory currentStep) internal view returns (address) {
        // non-zero stepAddress means override/ignore the stepTypeId
        // TODO do we want a white list of addresses for a given stepTypeId?
        if (currentStep.stepAddress == address(0)) {
            return getStepAddressInternal(currentStep.stepTypeId);
        }
        // ensure given address is in the whitelist for given stepTypeId
        EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
        require(
            eternalStorage.containsEnumerableMapAddressToUint(
                getStepWhitelistKey(currentStep.stepTypeId), currentStep.stepAddress
            ),
            "step address not in white list"
        );
        return currentStep.stepAddress;
    }

    function resolveAmounts(
        LibAssetBalances.AssetBalances memory assetBalances,
        WorkflowStepInputAsset[] memory inputAssets
    ) internal pure returns (AssetAmount[] memory) {
        AssetAmount[] memory rv = new AssetAmount[](inputAssets.length);
        for (uint256 i = 0; i < inputAssets.length; ++i) {
            WorkflowStepInputAsset memory stepInputAsset = inputAssets[i];
            rv[i].asset = stepInputAsset.asset;
            uint256 currentWorkflowAssetBalance = assetBalances.getAssetBalance(stepInputAsset.asset);
            if (stepInputAsset.amountIsPercent) {
                rv[i].amount = LibPercent.percentageOf(currentWorkflowAssetBalance, stepInputAsset.amount);
                // rv[i].amount = 1;
            } else {
                require(
                    currentWorkflowAssetBalance <= stepInputAsset.amount,
                    "absolute amount exceeds workflow asset balance"
                );
                rv[i].amount = stepInputAsset.amount;
            }
        }
        return rv;
    }

    function continueWorkflow(
        address userAddress,
        uint256 nonce,
        Workflow memory workflow,
        AssetAmount memory startingAsset
    ) external payable {
        emit WorkflowContinuation(nonce, userAddress, startingAsset);
        executeWorkflow(userAddress, workflow, startingAsset);
    }
}
