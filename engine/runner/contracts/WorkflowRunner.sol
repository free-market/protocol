// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

import '@freemarket/core/contracts/model/Workflow.sol';
import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/core/contracts/LibPercent.sol';
import '@freemarket/core/contracts/IWorkflowRunner.sol';
import './FrontDoor.sol';
import './LibAssetBalances.sol';
import './LibStorageWriter.sol';
import './EternalStorage.sol';
import './LibAsset.sol';
import './ChainBranch.sol';
import './AssetBalanceBranch.sol';
import 'hardhat/console.sol';
import './LibConfigReader.sol';

uint16 constant STEP_TYPE_ID_CHAIN_BRANCH = 1;
uint16 constant STEP_TYPE_ID_ASSET_AMOUNT_BRANCH = 2;

contract WorkflowRunner is FreeMarketBase, ReentrancyGuard, IWorkflowRunner {
  constructor(
    address payable frontDoorAddress
  )
    FreeMarketBase(
      msg.sender, // owner
      FrontDoor(frontDoorAddress).eternalStorageAddress(), // eternal storage address
      address(0), // upstream (this doesn't have one)
      false // isUserProxy
    )
  {}

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
  /// @param startingAssets The asset that was transferred from the source chain to this chain
  event WorkflowContinuation(uint256 nonce, address userAddress, AssetAmount[] startingAssets);

  using LibAssetBalances for LibAssetBalances.AssetBalances;

  function getStepAddress(uint16 stepTypeId) external view returns (address) {
    return LibConfigReader.getStepAddressInternal(eternalStorageAddress, stepTypeId);
  }

  function executeWorkflow(Workflow calldata workflow) external payable nonReentrant {
    AssetAmount[] memory startingAssets = new AssetAmount[](1);
    startingAssets[0] = AssetAmount(Asset(AssetType.Native, address(0)), 0);
    executeWorkflow(msg.sender, workflow, startingAssets);
  }

  function executeWorkflow(address userAddress, Workflow memory workflow, AssetAmount[] memory startingAssets) internal {
    emit WorkflowExecution(userAddress, workflow);
    // workflow starts on the step with index 0
    uint16 currentStepIndex = 0;
    // keep track of asset balances
    LibAssetBalances.AssetBalances memory assetBalances;
    // credit ETH if sent with this call
    if (msg.value != 0) {
      // TODO add event
      // console.log('crediting native', msg.value);
      assetBalances.credit(0, msg.value);
    }

    // credit any starting assets (if this is a continutation workflow with assets sent by a bridge)
    for (uint256 i = 0; i < startingAssets.length; i++) {
      AssetAmount memory startingAsset = startingAssets[i];
      if (startingAsset.amount > 0) {
        // console.log('crediting starting', startingAsset.asset.assetAddress, startingAsset.amount);
        assetBalances.credit(startingAsset.asset, startingAsset.amount);
      }
    }

    // loop through the steps
    if (workflow.steps.length > 0) {
      while (true) {
        // prepare to invoke the step
        WorkflowStep memory currentStep = workflow.steps[currentStepIndex];

        // ChainBranch and AssetAmountBranch are special
        if (currentStep.stepTypeId == STEP_TYPE_ID_CHAIN_BRANCH || currentStep.stepTypeId == STEP_TYPE_ID_ASSET_AMOUNT_BRANCH) {
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
        AssetAmount[] memory inputAssetAmounts = resolveAmounts(userAddress, assetBalances, currentStep.inputAssets);

        // console.log('calling id', currentStep.stepTypeId);
        // console.log('calling addr', stepAddress);
        // console.log('assetAmounts', inputAssetAmounts.length);
        // for (uint256 i = 0; i < inputAssetAmounts.length; ++i) {
        //   console.log('  input type', inputAssetAmounts[i].asset.assetType == AssetType.ERC20 ? 'erc20' : 'native');
        //   console.log('  input addr', inputAssetAmounts[i].asset.assetAddress);
        //   console.log('  input amount', inputAssetAmounts[i].amount);
        // }

        // invoke the step
        WorkflowStepResult memory stepResult = invokeStep(stepAddress, inputAssetAmounts, currentStep.argData);

        // console.log('stepResult.ouptputs', stepResult.outputAssetAmounts.length);
        // for (uint256 i = 0; i < stepResult.outputAssetAmounts.length; ++i) {
        //   console.log('output amount', stepResult.outputAssetAmounts[i].amount);
        // }

        emit WorkflowStepExecution(currentStepIndex, currentStep, currentStep.stepTypeId, stepAddress, inputAssetAmounts, stepResult);

        // debit input assets
        // console.log('result inputs', stepResult.inputAssetAmounts.length);
        for (uint256 i = 0; i < stepResult.inputAssetAmounts.length; ++i) {
          // console.log('  debit', i);
          // console.log('  debit addr', stepResult.inputAssetAmounts[i].asset.assetAddress);
          // console.log('  debit amt', stepResult.inputAssetAmounts[i].amount);
          assetBalances.debit(stepResult.inputAssetAmounts[i].asset, stepResult.inputAssetAmounts[i].amount);
        }
        // credit output assets
        // console.log('result outputs', stepResult.outputAssetAmounts.length);
        for (uint256 i = 0; i < stepResult.outputAssetAmounts.length; ++i) {
          // console.log('  credit', i);
          // console.log('  credit addr', stepResult.outputAssetAmounts[i].asset.assetAddress);
          // console.log('  credit amt', stepResult.outputAssetAmounts[i].amount);
          assetBalances.credit(stepResult.outputAssetAmounts[i].asset, stepResult.outputAssetAmounts[i].amount);
        }
        console.logInt(currentStep.nextStepIndex);
        if (currentStep.nextStepIndex == -1) {
          break;
        }
        currentStepIndex = uint16(currentStep.nextStepIndex);
      }
    }
    refundUser(userAddress, assetBalances);
  }

  function refundUser(address userAddress, LibAssetBalances.AssetBalances memory assetBalances) internal {
    // console.log('entering refundUser, numAssets=', assetBalances.getAssetCount());
    for (uint8 i = 0; i < assetBalances.getAssetCount(); ++i) {
      AssetAmount memory ab = assetBalances.getAssetAt(i);
      // console.log('  refunding asset', i);
      // console.log('    type', ab.asset.assetType == AssetType.ERC20 ? 'erc20' : 'native');
      // console.log('    addr', ab.asset.assetAddress);
      // console.log('    amt', ab.amount);
      Asset memory asset = ab.asset;
      uint256 feeAmount = LibPercent.percentageOf(ab.amount, 300);
      uint256 userAmount = ab.amount - feeAmount;
      emit RemainingAsset(asset, ab.amount, feeAmount, userAmount);
      if (asset.assetType == AssetType.Native) {
        require(address(this).balance >= ab.amount, 'computed native balance is greater than actual balance');
        payable(userAddress).transfer(userAmount);
      } else if (asset.assetType == AssetType.ERC20) {
        IERC20 token = IERC20(asset.assetAddress);
        // uint256 balance = token.balanceOf(address(this));
        // console.log('  refunding erc20 balance', balance);
        SafeERC20.safeTransfer(token, userAddress, userAmount);
      } else {
        revert('unknown asset type in assetBalances');
      }
    }
  }

  function invokeStep(
    address stepAddress,
    AssetAmount[] memory inputAssetAmounts,
    bytes memory data
  ) internal returns (WorkflowStepResult memory) {
    (bool success, bytes memory returnData) = stepAddress.delegatecall(
      abi.encodeWithSelector(IWorkflowStep.execute.selector, inputAssetAmounts, data)
    );
    require(success, string(returnData));
    return abi.decode(returnData, (WorkflowStepResult));
  }

  function resolveStepAddress(WorkflowStep memory currentStep) internal view returns (address) {
    if (currentStep.stepAddress == address(0)) {
      return LibConfigReader.getStepAddressInternal(eternalStorageAddress, currentStep.stepTypeId);
    }
    // ensure given address is in the whitelist for given stepTypeId
    require(
      LibConfigReader.isStepAddressWhitelisted(eternalStorageAddress, currentStep.stepTypeId, currentStep.stepAddress),
      'step address not in white list'
    );
    return currentStep.stepAddress;
  }

  function resolveAmounts(
    address userAddress,
    LibAssetBalances.AssetBalances memory assetBalances,
    WorkflowStepInputAsset[] memory inputAssets
  ) internal returns (AssetAmount[] memory) {
    AssetAmount[] memory rv = new AssetAmount[](inputAssets.length);
    for (uint256 i = 0; i < inputAssets.length; ++i) {
      WorkflowStepInputAsset memory stepInputAsset = inputAssets[i];
      rv[i].asset = stepInputAsset.asset;
      if (stepInputAsset.sourceIsCaller) {
        transferFromCaller(userAddress, stepInputAsset, assetBalances);
      }
      uint256 currentWorkflowAssetBalance = assetBalances.getAssetBalance(stepInputAsset.asset);
      if (stepInputAsset.amountIsPercent) {
        rv[i].amount = LibPercent.percentageOf(currentWorkflowAssetBalance, stepInputAsset.amount);
        // rv[i].amount = 1;
      } else {
        require(currentWorkflowAssetBalance >= stepInputAsset.amount, 'absolute amount exceeds workflow asset balance');
        rv[i].amount = stepInputAsset.amount;
      }
    }
    return rv;
  }

  function transferFromCaller(
    address userAddress,
    WorkflowStepInputAsset memory inputAssetAmount,
    LibAssetBalances.AssetBalances memory assetBalances
  ) internal {
    require(inputAssetAmount.amountIsPercent == false, 'cannot use percentage for amount of asset from caller');
    if (inputAssetAmount.asset.assetType == AssetType.Native) {
      // it's not possible to 'trasfer from caller' for native assets
      // assetBalances should have been initialized with the correct amount
    } else if (inputAssetAmount.asset.assetType == AssetType.ERC20) {
      console.log('transferFromCaller erc20', inputAssetAmount.asset.assetAddress, inputAssetAmount.amount);
      IERC20 token = IERC20(inputAssetAmount.asset.assetAddress);
      uint256 allowance = token.allowance(userAddress, address(this));
      require(allowance >= inputAssetAmount.amount, 'insufficient allowance for erc20');
      SafeERC20.safeTransferFrom(token, userAddress, address(this), inputAssetAmount.amount);
      assetBalances.credit(inputAssetAmount.asset, inputAssetAmount.amount);
    } else {
      revert('unknown asset type in inputAssetAmounts');
    }
  }

  function continueWorkflow(
    address userAddress,
    uint256 nonce,
    Workflow memory workflow,
    AssetAmount[] memory startingAssets
  ) external payable {
    // only step contracts are allowed to call this
    require(LibConfigReader.isStepAddressWhitelisted(eternalStorageAddress, msg.sender), 'caller is not a valid step');
    emit WorkflowContinuation(nonce, userAddress, startingAssets);
    for (uint256 i = 0; i < startingAssets.length; ++i) {
      if (startingAssets[i].asset.assetType == AssetType.Native) {
        // the calling step should have sent the correct amount of native
        require(msg.value >= startingAssets[i].amount, 'msg.value is less than starting asset amount');
      } else if (startingAssets[i].asset.assetType == AssetType.ERC20) {
        // the calling step should have approved the correct amount of the erc20
        IERC20 token = IERC20(startingAssets[i].asset.assetAddress);
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= startingAssets[i].amount, 'insufficient allowance for erc20');
        SafeERC20.safeTransferFrom(token, msg.sender, address(this), startingAssets[i].amount);
      } else {
        revert('unknown asset type in startingAssets');
      }
    }
    executeWorkflow(userAddress, workflow, startingAssets);
  }
}
