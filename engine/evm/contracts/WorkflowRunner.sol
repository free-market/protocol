// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

import './model/Workflow.sol';
import './FrontDoor.sol';
import './IWorkflowRunner.sol';
import './IActionManager.sol';
import './IUserProxyManager.sol';
import './UserProxy.sol';
import './LibAssetBalances.sol';
import './LibStorageWriter.sol';
import './EternalStorage.sol';
import './IWorkflowStep.sol';
import './LibAsset.sol';
import './LibPercent.sol';

contract WorkflowRunner is
  FreeMarketBase,
  ReentrancyGuard,
  IWorkflowRunner, /*IUserProxyManager,*/
  IActionManager
{
  constructor(address payable frontDoorAddress)
    FreeMarketBase(
      msg.sender, // owner
      FrontDoor(frontDoorAddress).eternalStorageAddress(), // eternal storage address
      address(0), // upstream (this doesn't have one)
      false // isUserProxy
    )
  {}

  // function createUserProxy() external {
  //   EternalStorage es = EternalStorage(eternalStorageAddress);
  //   bytes32 key = getUserProxyKey('userProxies', msg.sender);
  //   address currentAddress = es.getAddress(key);
  //   require(currentAddress != address(0x0000000000000000), 'user proxy already exists');
  //   key = keccak256(abi.encodePacked('frontDoor'));
  //   address frontDoorAddress = es.getAddress(key);
  //   UserProxy newUserProxy = new UserProxy(payable(msg.sender), eternalStorageAddress, frontDoorAddress);
  //   address userProxyAddress = address(newUserProxy);
  //   es.setAddress(key, userProxyAddress);
  // }

  // latestActionAddresses maps actionId to latest and greatest version of that action
  bytes32 constant latestActionAddresses = 0xc94d198e6194ea38dbd900920351d7f8e6c6d85b1d3b803fb93c54be008e11fd; // keccak256('latestActionAddresses')

  event ActionAddressSetEvent(uint16 actionId, address actionAddress);

  function getActionWhitelistKey(uint16 actionId) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked('actionWhiteList', actionId));
  }

  function getActionBlacklistKey(uint16 actionId) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked('actionBlackList', actionId));
  }

  function setActionAddress(uint16 actionId, address actionAddress) external onlyOwner {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    eternalStorage.setEnumerableMapUintToAddress(latestActionAddresses, actionId, actionAddress);
    // using the white list map like a set, we only care about the keys
    eternalStorage.setEnumerableMapAddressToUint(getActionWhitelistKey(actionId), actionAddress, 0);
    eternalStorage.removeEnumerableMapAddressToUint(getActionBlacklistKey(actionId), actionAddress);
    emit ActionAddressSetEvent(actionId, actionAddress);
  }

  function removeActionAddress(uint16 actionId, address actionAddress) external onlyOwner {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    address latest = eternalStorage.getEnumerableMapUintToAddress(latestActionAddresses, actionId);
    require(actionAddress != latest, 'cannot remove latest action address');
    eternalStorage.setEnumerableMapAddressToUint(getActionBlacklistKey(actionId), actionAddress, 0);
    eternalStorage.removeEnumerableMapAddressToUint(getActionWhitelistKey(actionId), actionAddress);
    emit ActionAddressSetEvent(actionId, actionAddress);
  }

  function getActionAddress(uint16 actionId) external view returns (address) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.getEnumerableMapUintToAddress(latestActionAddresses, actionId);
  }

  function getActionAddressInternal(uint16 actionId) internal view returns (address) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.getEnumerableMapUintToAddress(latestActionAddresses, actionId);
  }

  function getActionCount() external view returns (uint256) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.lengthEnumerableMapUintToAddress(latestActionAddresses);
  }

  function getActionInfoAt(uint256 index) public view returns (ActionInfo memory) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    (uint256 actionId, address actionAddress) = eternalStorage.atEnumerableMapUintToAddress(latestActionAddresses, index);

    bytes32 whitelistKey = getActionWhitelistKey(uint16(actionId));
    uint256 whitelistCount = eternalStorage.lengthEnumerableMapAddressToUint(whitelistKey);
    address[] memory whitelist = new address[](whitelistCount);
    for (uint256 i = 0; i < whitelistCount; ++i) {
      (address whitelistedAddress, ) = eternalStorage.atEnumerableMapAddressToUint(whitelistKey, i);
      whitelist[i] = whitelistedAddress;
    }

    bytes32 blacklistKey = getActionBlacklistKey(uint16(actionId));
    uint256 blacklistCount = eternalStorage.lengthEnumerableMapAddressToUint(blacklistKey);
    address[] memory blacklist = new address[](blacklistCount);
    for (uint256 i = 0; i < blacklistCount; ++i) {
      (address blacklistedAddress, ) = eternalStorage.atEnumerableMapAddressToUint(blacklistKey, i);
      blacklist[i] = blacklistedAddress;
    }

    return ActionInfo(uint16(actionId), actionAddress, whitelist, blacklist);
  }

  /// @notice This event is emitted when a workflow execution begins.
  /// @param userAddress The user for which this workflow is executing.
  /// @param workflow The workflow.
  event WorkflowExecution(address userAddress, Workflow workflow);

  /// @notice This event is emitted when immediately after invoking a step in the workflow.
  /// @param stepIndex The index of the step in the Workflow.steps array.
  /// @param step The step configuration.
  /// @param actionId The logical id of the step (also repeated in the step param but duplicated here for convenience).
  /// @param actionAddress The address of the step used for this invocation.
  /// @param inputAssetAmounts The input assets, with the absolute amount of each asset.
  /// @param result The result returned form the step invocation.
  event WorkflowStepExecution(
    uint16 stepIndex,
    WorkflowStep step,
    uint16 actionId,
    address actionAddress,
    AssetAmount[] inputAssetAmounts,
    WorkflowStepResult result
  );

  /// @notice This event is emitted after the workflow has completed, once for each asset ramining with a non-zero amount.
  /// @param asset The asset.
  /// @param totalAmount The total amount of the asset.
  /// @param feeAmount The portion of the total amount that FMP will keep as a fee.
  /// @param userAmount The portion of the total amount that is sent to the user.
  event RemainingAsset(Asset asset, uint256 totalAmount, uint256 feeAmount, uint256 userAmount);

  /// @notice This event is emitted when this is a continuation of a workflow from another chain.abi
  /// @param nonce The nonce provided by the caller on the source chain, used to correlate the source chain workflow segment with this segment.
  /// @param startingAsset The asset that was transferred from the source chain to this chain
  event WorkflowContinuation(uint256 nonce, address userAddress, AssetAmount startingAsset);

  using LibAssetBalances for LibAssetBalances.AssetBalances;

  function executeWorkflow(Workflow calldata workflow) external payable nonReentrant {
    AssetAmount memory startingAssets = AssetAmount(Asset(AssetType.Native, address(0)), 0);
    executeWorkflow(msg.sender, workflow, startingAssets);
  }

  function executeWorkflow(
    address userAddress,
    Workflow memory workflow,
    AssetAmount memory startingAsset
  ) internal {
    emit WorkflowExecution(userAddress, workflow);
    // workflow starts on the step with index 0
    uint16 currentStepIndex = 0;
    // used to keep track of asset balances
    LibAssetBalances.AssetBalances memory assetBalances;
    // credit ETH if sent with this call
    if (msg.value != 0) {
      // TODO add event
      assetBalances.credit(0, uint256(msg.value));
    }
    // credit any starting assets (if this is a continutation workflow with assets sent by a bridge)
    if (startingAsset.amount > 0) {
      assetBalances.credit(startingAsset.asset, startingAsset.amount);
    }
    while (true) {
      // prepare to invoke the step
      WorkflowStep memory currentStep = workflow.steps[currentStepIndex];
      address actionAddress = resolveActionAddress(currentStep);
      AssetAmount[] memory inputAssetAmounts = resolveAmounts(assetBalances, currentStep.inputAssets);

      // invoke the step
      WorkflowStepResult memory stepResult = invokeStep(actionAddress, inputAssetAmounts, currentStep.outputAssets, currentStep.data);
      emit WorkflowStepExecution(currentStepIndex, currentStep, currentStep.actionId, actionAddress, inputAssetAmounts, stepResult);

      // debit input assets
      for (uint256 i = 0; i < inputAssetAmounts.length; ++i) {
        assetBalances.debit(inputAssetAmounts[i].asset, inputAssetAmounts[i].amount);
      }
      // credit output assets
      for (uint256 i = 0; i < stepResult.outputAssetAmounts.length; ++i) {
        assetBalances.credit(stepResult.outputAssetAmounts[i].asset, stepResult.outputAssetAmounts[i].amount);
      }
      if (currentStep.nextStepIndex == -1) {
        break;
      }
      currentStepIndex = uint16(currentStep.nextStepIndex);
    }
    refundUser(userAddress, assetBalances);
  }

  function refundUser(address userAddress, LibAssetBalances.AssetBalances memory assetBalances) internal {
    for (uint8 i = 0; i < assetBalances.getAssetCount(); ++i) {
      AssetAmount memory ab = assetBalances.getAssetAt(i);
      Asset memory asset = ab.asset;
      uint256 feeAmount = LibPercent.percentageOf(ab.amount, 300);
      uint256 userAmount = ab.amount - feeAmount;
      emit RemainingAsset(asset, ab.amount, feeAmount, userAmount);
      if (asset.assetType == AssetType.Native) {
        // TODO this needs a unit test
        require(address(this).balance == ab.amount, 'computed native balance does not match actual balance');
        (bool sent, bytes memory data) = payable(userAddress).call{value: userAmount}('');
        require(sent, string(data));
      } else if (asset.assetType == AssetType.ERC20) {
        IERC20 token = IERC20(asset.assetAddress);
        SafeERC20.safeTransfer(token, userAddress, userAmount);
      } else {
        revert('unknown asset type in assetBalances');
      }
    }
  }

  function invokeStep(
    address actionAddress,
    AssetAmount[] memory inputAssetAmounts,
    Asset[] memory outputAssets,
    bytes memory data
  ) internal returns (WorkflowStepResult memory) {
    (bool success, bytes memory returnData) = actionAddress.delegatecall(
      abi.encodeWithSelector(IWorkflowStep.execute.selector, inputAssetAmounts, outputAssets, data)
    );
    require(success, string(returnData));
    return abi.decode(returnData, (WorkflowStepResult));
  }

  function resolveActionAddress(WorkflowStep memory currentStep) internal view returns (address) {
    // non-zero actionAddress means override/ignore the actionId
    // TODO do we want a white list of addresses for a given actionId?
    if (currentStep.actionAddress == address(0)) {
      return getActionAddressInternal(currentStep.actionId);
    }
    // ensure given address is in the whitelist for given actionId
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    require(
      eternalStorage.containsEnumerableMapAddressToUint(getActionWhitelistKey(currentStep.actionId), currentStep.actionAddress),
      'action address not in white list'
    );
    return currentStep.actionAddress;
  }

  function resolveAmounts(LibAssetBalances.AssetBalances memory assetBalances, WorkflowStepInputAsset[] memory inputAssets)
    internal
    pure
    returns (AssetAmount[] memory)
  {
    AssetAmount[] memory rv = new AssetAmount[](inputAssets.length);
    for (uint256 i = 0; i < inputAssets.length; ++i) {
      WorkflowStepInputAsset memory stepInputAsset = inputAssets[i];
      rv[i].asset = stepInputAsset.asset;
      uint256 currentWorkflowAssetBalance = assetBalances.getAssetBalance(stepInputAsset.asset);
      if (stepInputAsset.amountIsPercent) {
        rv[i].amount = LibPercent.percentageOf(currentWorkflowAssetBalance, stepInputAsset.amount);
        // rv[i].amount = 1;
      } else {
        require(currentWorkflowAssetBalance <= stepInputAsset.amount, 'absolute amount exceeds workflow asset balance');
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
