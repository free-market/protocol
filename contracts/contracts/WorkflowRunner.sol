// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
// import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import './thirdParty/Weth.sol';

import './FrontDoor.sol';
import './IWorkflowRunner.sol';
import './IUserProxyManager.sol';
import './UserProxy.sol';
import './integrations/Curve.sol';

/// @dev inheriting from FrontDoor so storage slots align
contract WorkflowRunner is FrontDoor, IWorkflowRunner, IUserProxyManager {
  address constant wethAddress = address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
  address constant wbtcAddress = address(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599);
  address constant usdtAddress = address(0xdAC17F958D2ee523a2206206994597C13D831ec7);
  address constant usdcAddress = address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  address constant daiAddress = address(0x6B175474E89094C44Da98b954EedeAC495271d0F);

  Weth constant weth = Weth(wethAddress);

  // IERC20 constant usdt = IERC20(usdtAddress);

  function createUserProxy() external {
    address a = eternalStorageAddress;
    EternalStorage es = EternalStorage(a);
    // bytes32 key = keccak256(abi.encodePacked('userProxies', msg.sender));
    bytes32 key = getAddressKey('userProxies', msg.sender);
    address currentAddress = es.getAddress(key);
    require(currentAddress == address(0x0000000000000000), 'user proxy already exists');
    UserProxy newUserProxy = new UserProxy(payable(msg.sender), frontDoorAddress);
    address userProxyAddress = address(newUserProxy);
    es.setAddress(key, userProxyAddress);
  }

  function getAddressKey(string memory category, address addr) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(category, addr));
  }

  function getUserProxy() external view returns (address) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    bytes32 key = getAddressKey('userProxies', msg.sender);
    return eternalStorage.getAddress(key);
  }

  function executeWorkflow(uint256[] calldata args) external payable {
    // the first arg is the starting amount
    uint256 nextAmount = args[0];
    uint16 argsIndex = 1;
    while (argsIndex < args.length) {
      (uint256 argsConsumed, uint256 outcomeAmount) = getStepFunc(args[argsIndex])(nextAmount, args[argsIndex + 1:]);
      argsIndex += 1 + uint16(argsConsumed);
      nextAmount = outcomeAmount;
    }
  }

  function ethToWeth(uint256 amount, uint256[] calldata) public payable returns (uint16, uint256) {
    weth.deposit{value: amount}();
    return (0, amount);
  }

  function wormhole(uint256, uint256[] calldata) internal pure returns (uint16, uint256) {
    return (0, 0);
  }

  // args[0] is the token address, or 0x0 if its supposed to be eth
  function withdrawal(uint256 amount, uint256[] calldata args) public payable returns (uint16, uint256) {
    address payable user = owner;
    if (args[0] == 0x0) {
      (bool success, ) = user.call{value: amount}('');
      require(success, 'withdraw eth failed');
    } else {
      address tokenAddress = address(uint160(args[0]));
      IERC20 token = IERC20(tokenAddress);
      SafeERC20.safeTransfer(token, user, amount);
    }
    // this has to be a terminal step, so returning 0 for amount
    return (1, 0);
  }

  function getStepFunc(uint256 index) private returns (function(uint256, uint256[] calldata) returns (uint16, uint256)) {
    if (index < 4) {
      // 0..3
      if (index < 2) {
        if (index == 0) {
          return ethToWeth;
        } else {
          return Curve.curveTriCryptoPoolSwap;
        }
      } else {
        if (index == 2) {
          return Curve.curve3PoolSwap;
        } else {
          return wormhole;
        }
      }
    } else {
      // 4..7
      if (index < 6) {
        if (index == 4) {
          return withdrawal;
        } else {
          // TODO return something
          return withdrawal;
        }
      } else {
        if (index == 6) {
          // TODO return something
          return withdrawal;
        } else {
          // TODO return something
          return withdrawal;
        }
      }
    }
  }
}
