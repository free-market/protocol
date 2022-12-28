// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import './FrontDoor.sol';
import './IWorkflowRunner.sol';
import './IActionManager.sol';
import './Workflow.sol';
import './IUserProxyManager.sol';
import './UserProxy.sol';
import './LibAssetBalances.sol';
import './LibStorageWriter.sol';
import './EternalStorage.sol';

import './actions/curve/Curve.sol';
import './actions/wormhole/Wormhole.sol';

contract WorkflowRunner is FreeMarketBase, IWorkflowRunner, IUserProxyManager, IActionManager {
  constructor(address frontDoorAddress)
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

  // event WorkflowStep()

  function executeWorkflow(Workflow calldata workflow, WorkflowParameter[] calldata params) external payable {
    // IERC20 weth = IERC20(wethAddress);
    // uint256 wethBalance = weth.balanceOf(msg.sender);
    // uint256 beforeAmount = toToken.balanceOf(address(this));
    emit WorkflowExecution(msg.sender);
    if (workflow.steps.length > 0) {
      WorkflowStep calldata first = workflow.steps[0];
      // fir
    }

    // libAssetBalances.AssetBalances memory assetBalances;
    // for (uint8 stepIndex = 0; stepIndex < steps.length; ++stepIndex) {
    //   WorkflowStepDef calldata step = steps[stepIndex];
    //   // address fromToken = address(step.fromAsset);
    //   int256 amount = step.amount;
    //   // percent means relative to balances created by previous steps, not percent of the caller's total balance of that token
    //   if (step.amountIsPercent) {
    //     require(step.amount <= 100, 'invalid workflow, cannot specify a percentage greater than 100');
    //     uint256 amountFromPreviousSteps = libAsset.get(assetBalances, step.fromAsset);
    //     require(amountFromPreviousSteps != 0, 'invalid workflow, cannot use a percentage of a token with a 0 balance');
    //     amount = (amountFromPreviousSteps * amount) / 100;
    //   }
    //   (address toToken, uint256 outcomeAmount) = getStepFunc(step.stepId)(fromToken, amount, step.args);
    //   if (step.amountIsPercent) {
    //     libAsset.debit(assetBalances, fromAsset, amount);
    //   }
    //   libAsset.credit(assetBalances, toToken, outcomeAmount);
    // }
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
