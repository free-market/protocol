// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

import '@freemarket/core/contracts/model/Workflow.sol';
import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/core/contracts/IWorkflowStepBeforeAll.sol';
import '@freemarket/core/contracts/IWorkflowStepAfterAll.sol';
import '@freemarket/core/contracts/LibPercent.sol';
import '@freemarket/core/contracts/IWorkflowRunner.sol';
import './FrontDoor.sol';
import './LibAssetBalances.sol';
import './ChainBranch.sol';
import './AssetComparisons.sol';
import './LibConfigReader.sol';
import 'hardhat/console.sol';

uint16 constant STEP_TYPE_ID_CHAIN_BRANCH = 1;
uint16 constant STEP_TYPE_ID_ASSET_AMOUNT_BRANCH = 2;
uint16 constant STEP_TYPE_ID_PREV_OUTPUT_BRANCH = 3;

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
    WorkflowStepResult result,
    uint256[] feesTaken
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

  function executeWorkflow(Workflow calldata workflow) external payable {
    AssetAmount[] memory startingAssets = new AssetAmount[](1);
    startingAssets[0] = AssetAmount(Asset(AssetType.Native, address(0)), 0);
    executeWorkflow(msg.sender, workflow, startingAssets);
  }

  function executeWorkflow(address userAddress, Workflow memory workflow, AssetAmount[] memory startingAssets) internal nonReentrant {
    emit WorkflowExecution(userAddress, workflow);
    // workflow starts on the step with index 0
    uint16 currentStepIndex = 0;
    // keep track of asset balances
    LibAssetBalances.AssetBalances memory assetBalances;
    // credit ETH if sent with this call
    if (msg.value != 0) {
      // TODO add event
      assetBalances.credit(0, msg.value);
    }

    // credit any starting assets (if this is a continutation workflow with assets sent by a bridge)
    for (uint256 i = 0; i < startingAssets.length; i++) {
      AssetAmount memory startingAsset = startingAssets[i];
      if (startingAsset.amount > 0) {
        assetBalances.credit(startingAsset.asset, startingAsset.amount);
      }
    }

    executeBeforeAlls(workflow, userAddress);

    bool isSubscriber = LibConfigReader.isSubscriber(eternalStorageAddress, msg.sender);
    bool feeAlreadyTaken = isSubscriber;

    // execute steps
    if (workflow.steps.length > 0) {
      while (true) {
        // prepare to invoke the step
        WorkflowStep memory currentStep = workflow.steps[currentStepIndex];

        // handle core branch step types here
        if (currentStep.stepTypeId >= STEP_TYPE_ID_CHAIN_BRANCH && currentStep.stepTypeId <= STEP_TYPE_ID_PREV_OUTPUT_BRANCH) {
          int16 nextStepIndex;
          if (currentStep.stepTypeId == STEP_TYPE_ID_CHAIN_BRANCH) {
            nextStepIndex = ChainBranch.getNextStepIndex(currentStep);
          } else if (currentStep.stepTypeId == STEP_TYPE_ID_ASSET_AMOUNT_BRANCH) {
            nextStepIndex = AssetComparison.getNextStepIndex(currentStep, assetBalances, AssetComparisonType.Balance);
          } else {
            // step type must be STEP_TYPE_ID_PREV_OUTPUT_BRANCH
            nextStepIndex = AssetComparison.getNextStepIndex(currentStep, assetBalances, AssetComparisonType.Credit);
          }
          if (nextStepIndex == -1) {
            break;
          }
          currentStepIndex = uint16(nextStepIndex);
          continue;
        }

        address stepAddress = resolveStepAddress(currentStep.stepAddress, currentStep.stepTypeId);
        AssetAmount[] memory inputAssetAmounts = resolveAmounts(userAddress, assetBalances, currentStep.inputAssets);

        // invoke the step
        WorkflowStepResult memory stepResult = invokeStep(stepAddress, inputAssetAmounts, currentStep.argData, userAddress);

        // debit input assets
        for (uint256 i = 0; i < stepResult.inputAssetAmounts.length; ++i) {
          assetBalances.debit(stepResult.inputAssetAmounts[i].asset, stepResult.inputAssetAmounts[i].amount);
        }

        // determine if fee is relative or absolute, and fee amount
        bool feeIsPercent;
        uint256 stepFee = 0;
        if (stepResult.fee != -1) {
          // fee is in decibips
          stepFee = uint24(stepResult.fee);
          // just treat it as an absolute 0 if it's 0% to avoid extra computation later
          feeIsPercent = stepFee > 0;
        } else {
          // fee is absolute
          (stepFee, feeIsPercent) = LibConfigReader.getStepFee(eternalStorageAddress, currentStep.stepTypeId);
        }

        uint256[] memory feesTaken = new uint256[](stepResult.outputAssetAmounts.length);
        // credit output assets
        for (uint256 i = 0; i < stepResult.outputAssetAmounts.length; ++i) {
          // calculate exact fee
          uint256 feeAmount;
          if (isSubscriber) {
            feeAmount = 0;
          } else if (feeIsPercent) {
            feeAmount = LibPercent.percentageOf(stepResult.outputAssetAmounts[i].amount, stepFee);
          } else {
            feeAmount = stepFee;
          }
          feeAlreadyTaken = feeAlreadyTaken || feeAmount > 0;
          uint256 callerAmount = stepResult.outputAssetAmounts[i].amount - feeAmount;
          assetBalances.credit(stepResult.outputAssetAmounts[i].asset, callerAmount);
          feesTaken[i] = feeAmount;
        }

        emit WorkflowStepExecution(
          currentStepIndex,
          currentStep,
          currentStep.stepTypeId,
          stepAddress,
          inputAssetAmounts,
          stepResult,
          feesTaken
        );

        if (currentStep.nextStepIndex == -1) {
          break;
        }
        currentStepIndex = uint16(currentStep.nextStepIndex);
      }
    }

    executeAfterAlls(workflow, userAddress);

    refundUser(userAddress, assetBalances, feeAlreadyTaken);
  }

  function executeBeforeAlls(Workflow memory workflow, address userAddress) internal {
    for (uint256 i = 0; i < workflow.beforeAll.length; ++i) {
      executeBeforeAfter(IWorkflowStepBeforeAll.beforeAll.selector, workflow.beforeAll[i], userAddress);
    }
  }

  function executeAfterAlls(Workflow memory workflow, address userAddress) internal {
    for (uint256 i = 0; i < workflow.afterAll.length; ++i) {
      executeBeforeAfter(IWorkflowStepAfterAll.afterAll.selector, workflow.afterAll[i], userAddress);
    }
  }

  function executeBeforeAfter(bytes4 selector, BeforeAfter memory beforeAfter, address userAddress) internal {
    address stepAddress = resolveStepAddress(beforeAfter.stepAddress, beforeAfter.stepTypeId);
    (bool success, bytes memory returnData) = stepAddress.delegatecall(abi.encodeWithSelector(selector, beforeAfter.argData, userAddress));
    require(success, string(returnData));
  }

  function refundUser(address userAddress, LibAssetBalances.AssetBalances memory assetBalances, bool feeAlreadyTaken) internal {
    uint256 fee;
    bool feeIsPercent;
    // console.log('fat', feeAlreadyTaken);
    if (feeAlreadyTaken) {
      // fees taken during one or more steps
      fee = 0;
      feeIsPercent = false;
    } else {
      (fee, feeIsPercent) = LibConfigReader.getDefaultFee(eternalStorageAddress);
      // treat 0% as absolute 0
      feeIsPercent = feeIsPercent && fee > 0;
    }

    // console.log('abcnt', assetBalances.getAssetCount());
    for (uint8 i = 0; i < assetBalances.getAssetCount(); ++i) {
      // console.log('loop', i);
      AssetAmount memory ab = assetBalances.getAssetAt(i);
      Asset memory asset = ab.asset;
      uint256 feeAmount;
      if (feeIsPercent) {
        feeAmount = LibPercent.percentageOf(ab.amount, fee);
        // console.log('ru pct a', ab.amount, fee, feeAmount);
      } else {
        feeAmount = fee;
        // console.log('ru abs', feeAmount);
      }
      uint256 userAmount = ab.amount < feeAmount ? ab.amount : ab.amount - feeAmount;
      emit RemainingAsset(asset, ab.amount, feeAmount, userAmount);
      if (asset.assetType == AssetType.Native) {
        require(address(this).balance >= ab.amount, 'computed native > actual');
        payable(userAddress).transfer(userAmount);
      } else if (asset.assetType == AssetType.ERC20) {
        IERC20 token = IERC20(asset.assetAddress);
        SafeERC20.safeTransfer(token, userAddress, userAmount);
      } else {
        revert('unknown asset type in assetBalances');
      }
    }
  }

  function invokeStep(
    address stepAddress,
    AssetAmount[] memory inputAssetAmounts,
    bytes memory data,
    address userAddress
  ) internal returns (WorkflowStepResult memory) {
    (bool success, bytes memory returnData) = stepAddress.delegatecall(
      abi.encodeWithSelector(IWorkflowStep.execute.selector, inputAssetAmounts, data, userAddress)
    );
    require(success, string(returnData));
    return abi.decode(returnData, (WorkflowStepResult));
  }

  function resolveStepAddress(address frozenStepAddress, uint16 stepTypeId) internal view returns (address) {
    // address zero indicates that the step implementation is not frozen
    if (frozenStepAddress == address(0)) {
      return LibConfigReader.getStepAddressInternal(eternalStorageAddress, stepTypeId);
    }
    // ensure given address is in the whitelist for given stepTypeId
    bool isWhitelisted = LibConfigReader.isStepAddressWhitelisted(eternalStorageAddress, stepTypeId, frozenStepAddress);
    require(isWhitelisted, 'step not white listed');
    return frozenStepAddress;
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
        require(currentWorkflowAssetBalance >= stepInputAsset.amount, 'absolute amt > wf balance');
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
    require(inputAssetAmount.amountIsPercent == false, 'rel not supported');
    if (inputAssetAmount.asset.assetType == AssetType.Native) {
      // it's not possible to 'trasfer from caller' for native assets
      // assetBalances should have been initialized with the correct amount
    } else if (inputAssetAmount.asset.assetType == AssetType.ERC20) {
      IERC20 token = IERC20(inputAssetAmount.asset.assetAddress);
      uint256 balanceBefore = token.balanceOf(address(this));
      SafeERC20.safeTransferFrom(token, userAddress, address(this), inputAssetAmount.amount);
      uint256 balanceIncrease = token.balanceOf(address(this)) - balanceBefore;
      assetBalances.credit(inputAssetAmount.asset, balanceIncrease);
    } else {
      revert('unk asset type in inputAssetAmounts');
    }
  }

  function continueWorkflow(
    address userAddress,
    uint256 nonce,
    Workflow memory workflow,
    AssetAmount[] memory startingAssets
  ) external payable {
    // only step contracts are allowed to call this
    require(LibConfigReader.isStepAddressWhitelisted(eternalStorageAddress, msg.sender), 'caller not valid');
    emit WorkflowContinuation(nonce, userAddress, startingAssets);
    for (uint256 i = 0; i < startingAssets.length; ++i) {
      if (startingAssets[i].asset.assetType == AssetType.Native) {
        // the calling step should have sent the correct amount of native
        require(msg.value >= startingAssets[i].amount, 'msg.value < starting asset amount');
      } else if (startingAssets[i].asset.assetType == AssetType.ERC20) {
        // the calling step should have approved the correct amount of the erc20
        IERC20 token = IERC20(startingAssets[i].asset.assetAddress);
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= startingAssets[i].amount, 'insuf. allow for erc20');
        SafeERC20.safeTransferFrom(token, msg.sender, address(this), startingAssets[i].amount);
      } else {
        revert('unk asset type in startingAssets');
      }
    }
    executeWorkflow(userAddress, workflow, startingAssets);
  }
}
