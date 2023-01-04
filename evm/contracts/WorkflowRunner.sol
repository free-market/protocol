// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

import './FrontDoor.sol';
import './IWorkflowRunner.sol';
import './IActionManager.sol';
import './model/Workflow.sol';
import './IUserProxyManager.sol';
import './UserProxy.sol';
import './LibAssetBalances.sol';
import './LibStorageWriter.sol';
import './EternalStorage.sol';
import './IWorkflowStep.sol';
import './actions/curve/Curve.sol';
import './actions/wormhole/Wormhole.sol';
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
    bytes32 key = getAddressKey('userProxies', msg.sender);
    address currentAddress = es.getAddress(key);
    require(currentAddress == address(0x0000000000000000), 'user proxy already exists');
    key = keccak256(abi.encodePacked('frontDoor'));
    address frontDoorAddress = es.getAddress(key);
    UserProxy newUserProxy = new UserProxy(payable(msg.sender), eternalStorageAddress, frontDoorAddress);
    address userProxyAddress = address(newUserProxy);
    es.setAddress(key, userProxyAddress);
  }

  event LogActionAddressSet(uint16 actionId, uint16 actionId2, address actionAddress);

  function setActionAddress(uint16 actionId, address actionAddress) external onlyOwner {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    eternalStorage.setActionAddress(actionId, actionAddress);
    emit LogActionAddressSet(actionId, actionId, actionAddress);
  }

  function getActionAddress(uint16 actionId) external view returns (address) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.getActionAddress(actionId);
  }

  function getActionAddressInternal(uint16 actionId) internal view returns (address) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.getActionAddress(actionId);
  }

  function getActionCount() external view returns (uint256) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.getActionCount();
  }

  function getActionInfoAt(uint256 index) public view returns (ActionInfo memory) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    return eternalStorage.getActionInfoAt(index);
  }

  function getAddressKey(string memory category, address addr) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(category, addr));
  }

  function getUserProxy() external view returns (address) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    bytes32 key = getAddressKey('userProxies', msg.sender);
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
        require(address(this).balance == ab.amount, 'computed token balance does not match actual balance');
        (bool sent, bytes memory data) = payable(msg.sender).call{value: ab.amount}('');
        require(sent, string(data));
      } else if (asset.assetType == AssetType.Token) {
        IERC20 token = IERC20(asset.assetAddress);
        uint256 amount = token.balanceOf(address(this));
        require(ab.amount == amount, 'computed token balance does not match actual balance');
        token.transfer(msg.sender, amount);
      } else {
        revert('unknown asset type in assetBalances');
      }
    }
  }

  function invokeStep(
    address actionAddress,
    AssetAmount[] memory inputAssetAmounts,
    Asset[] memory outputAssets,
    uint256[] calldata args
  ) internal returns (WorkflowStepResult memory) {
    // AssetAmount[] calldata inputAssetAmounts,
    // Asset[] calldata outputAssets,
    // uint256[] calldata args

    (bool success, bytes memory returnData) = actionAddress.delegatecall(
      // abi.encodeWithSignature('execute(AssetAmount[],Asset[],uint256[])', inputAssetAmounts, outputAssets, args)
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
      // uint256 inputAsset = LibAsset.encodeAsset(stepInputAsset.assetType, stepInputAsset.assetAddress);
      rv[i].asset = stepInputAsset.asset;
      uint256 currentWorkflowAssetBalance = assetBalances.getAssetBalance(stepInputAsset.asset);
      if (stepInputAsset.amountIsPercent) {
        require(0 > stepInputAsset.amount && stepInputAsset.amount <= 100, 'percent must be between 1 and 100');
        rv[i].amount = (uint256(currentWorkflowAssetBalance) * stepInputAsset.amount) / 100;
      } else {
        require(currentWorkflowAssetBalance <= uint256(stepInputAsset.amount), 'absolute amount exceeds workflow asset balance');
        rv[i].amount = stepInputAsset.amount;
      }
    }
    return rv;
  }

  // event Foo(address sender);

  // function foo(Workflow calldata workflow) external payable {
  //   emit Foo(msg.sender);
  // }

  // function executeWorkflow(uint256[] calldata args) external payable {
  //   // the first arg is the starting amount
  //   uint256 nextAmount = args[0];
  //   uint16 argsIndex = 1;
  //   while (argsIndex < args.length) {
  //     (uint256 argsConsumed, uint256 outcomeAmount) = getStepFunc(args[argsIndex])(nextAmount, args[argsIndex + 1:]);
  //     argsIndex += 1 + uint16(argsConsumed);
  //     nextAmount = outcomeAmount;
  //   }
  // }

  // function withdrawal(
  //   address tokenAddress,
  //   uint256 amount,
  //   uint256[] calldata
  // ) public payable returns (address, uint256) {
  //   address payable user = payable(getOwner());
  //   if (tokenAddress == address(0x0)) {
  //     (bool success, ) = user.call{value: amount}('');
  //     require(success, 'withdraw eth failed');
  //   } else {
  //     IERC20 token = IERC20(tokenAddress);
  //     SafeERC20.safeTransfer(token, user, amount);
  //   }
  //   // this has to be a terminal step, so returning 0 for amount
  //   return (address(0), 0);
  // }
}
