// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

import './model/Workflow.sol';
import './actions/curve/Curve.sol';
import './actions/wormhole/Wormhole.sol';
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

contract WorkflowRunner is FreeMarketBase, ReentrancyGuard, IWorkflowRunner, IUserProxyManager, IActionManager {
  constructor(address payable frontDoorAddress)
    FreeMarketBase(
      msg.sender, // owner
      FrontDoor(frontDoorAddress).eternalStorageAddress(), // eternal storage address
      address(0), // upstream (this doesn't have one)
      false // isUserProxy
    )
  {}

  // mainnet
  address constant wethAddress = address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
  address constant wbtcAddress = address(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599);
  address constant usdtAddress = address(0xdAC17F958D2ee523a2206206994597C13D831ec7);
  address constant usdcAddress = address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  address constant daiAddress = address(0x6B175474E89094C44Da98b954EedeAC495271d0F);

  // goerli
  // address constant wethAddress = address(0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6);

  IERC20 constant usdt = IERC20(usdtAddress);

  function createUserProxy() external {
    EternalStorage es = EternalStorage(eternalStorageAddress);
    // bytes32 key = keccak256(abi.encodePacked('userProxies', msg.sender));
    bytes32 key = getUserProxyKey('userProxies', msg.sender);
    address currentAddress = es.getAddress(key);
    require(currentAddress != address(0x0000000000000000), 'user proxy already exists');
    key = keccak256(abi.encodePacked('frontDoor'));
    address frontDoorAddress = es.getAddress(key);
    UserProxy newUserProxy = new UserProxy(payable(msg.sender), eternalStorageAddress, frontDoorAddress);
    address userProxyAddress = address(newUserProxy);
    es.setAddress(key, userProxyAddress);
  }

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

  function getUserProxyKey(string memory category, address addr) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(category, addr));
  }

  function getUserProxy() external view returns (address) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    bytes32 key = getUserProxyKey('userProxies', msg.sender);
    return eternalStorage.getAddress(key);
  }

  event WorkflowExecution(address sender);
  event WorkflowStepExecution(uint16 stepIndex, WorkflowStep step, address actionAddress, AssetAmount[] assetAmounts);
  event WorkflowStepResultEvent(WorkflowStepResult result);
  event RemainingAsset(Asset asset, uint256 amount);
  // event RemainingAsset(uint8 assetType, address assetAddress, uint256 amount);
  // event WorkflowStep()
  using LibAssetBalances for LibAssetBalances.AssetBalances;

  function executeWorkflow(
    Workflow calldata workflow,
    WorkflowParameter[] calldata /*params*/
  ) external payable nonReentrant {
    emit WorkflowExecution(msg.sender);
    // workflow starts on the step with index 0
    uint16 currentStepIndex = 0;
    // used to keep track of asset balances
    LibAssetBalances.AssetBalances memory assetBalances;
    // credit ETH if sent with this call
    if (msg.value != 0) {
      assetBalances.credit(0, uint256(msg.value));
    }
    while (true) {
      // prepare to invoke the step
      WorkflowStep calldata currentStep = workflow.steps[currentStepIndex];
      address actionAddress = resolveActionAddress(currentStep);
      AssetAmount[] memory inputAssetAmounts = resolveAmounts(assetBalances, currentStep.inputAssets);
      // invoke the step
      emit WorkflowStepExecution(currentStepIndex, currentStep, actionAddress, inputAssetAmounts);
      WorkflowStepResult memory stepResult = invokeStep(actionAddress, inputAssetAmounts, currentStep.outputAssets, currentStep.args);
      emit WorkflowStepResultEvent(stepResult);

      // debit input assets
      for (uint256 i = 0; i < inputAssetAmounts.length; ++i) {
        assetBalances.debit(inputAssetAmounts[i].asset, inputAssetAmounts[i].amount);
      }
      // credit output assets
      for (uint256 i = 0; i < stepResult.outputAssetAmounts.length; ++i) {
        assetBalances.credit(stepResult.outputAssetAmounts[i].asset, stepResult.outputAssetAmounts[i].amount);
      }
      if (currentStep.nextStepIndex == 0) {
        break;
      }
    }
    refundCaller(assetBalances);
  }

  function refundCaller(LibAssetBalances.AssetBalances memory assetBalances) internal {
    for (uint8 i = 0; i < assetBalances.getAssetCount(); ++i) {
      AssetAmount memory ab = assetBalances.getAssetAt(i);
      Asset memory asset = ab.asset;
      emit RemainingAsset(asset, ab.amount);
      if (asset.assetType == AssetType.Native) {
        require(address(this).balance == ab.amount, 'computed native balance does not match actual balance');
        (bool sent, bytes memory data) = payable(msg.sender).call{value: ab.amount}('');
        require(sent, string(data));
      } else if (asset.assetType == AssetType.ERC20) {
        IERC20 token = IERC20(asset.assetAddress);
        uint256 amount = token.balanceOf(address(this));
        require(ab.amount == amount, 'computed token balance does not match actual balance');
        SafeERC20.safeTransfer(token, msg.sender, amount);
      } else {
        revert('unknown asset type in assetBalances');
      }
    }
  }

  function invokeStep(
    address actionAddress,
    AssetAmount[] memory inputAssetAmounts,
    Asset[] memory outputAssets,
    bytes calldata args
  ) internal returns (WorkflowStepResult memory) {
    (bool success, bytes memory returnData) = actionAddress.delegatecall(
      abi.encodeWithSelector(IWorkflowStep.execute.selector, inputAssetAmounts, outputAssets, args)
    );
    require(success, string(returnData));
    return abi.decode(returnData, (WorkflowStepResult));
  }

  function resolveActionAddress(WorkflowStep calldata currentStep) internal view returns (address) {
    // non-zero actionAddress means override/ignore the actionId
    // TODO do we want a white list of addresses for a given actionId?
    if (currentStep.actionAddress == address(0)) {
      return getActionAddressInternal(currentStep.actionId);
    }
    return currentStep.actionAddress;
  }

  function resolveAmounts(LibAssetBalances.AssetBalances memory assetBalances, WorkflowStepInputAsset[] calldata inputAssets)
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
        require(0 < stepInputAsset.amount && stepInputAsset.amount <= 100_000, 'percent must be between 1 and 100_000');
        rv[i].amount = (uint256(currentWorkflowAssetBalance) * stepInputAsset.amount) / 100_000;
      } else {
        require(currentWorkflowAssetBalance <= stepInputAsset.amount, 'absolute amount exceeds workflow asset balance');
        rv[i].amount = stepInputAsset.amount;
      }
    }
    return rv;
  }
}
