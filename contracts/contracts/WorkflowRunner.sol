// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './FrontDoor.sol';
import './thirdParty/Weth.sol';
// import './AddressSet.sol';
// import './Ownable.sol';
// import './ImmutableProxy.sol';
// import './MutableProxy.sol';
import './IWorkflowRunner.sol';
import './CurveCryptoSwap.sol';
import './CurveStableSwap.sol';
import './OwnableImmutableProxy.sol';
import './UserProxy.sol';

/// @dev inheriting from FrontDoor so storage slots align
contract WorkflowRunner is FrontDoor, IWorkflowRunner {
  address constant curveTriCryptoAddress = address(0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5);
  address constant curve3PoolAddress = address(0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5);

  address constant wethAddress = address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
  address constant wbtcAddress = address(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599);
  address constant usdtAddress = address(0xdAC17F958D2ee523a2206206994597C13D831ec7);
  address constant usdcAddress = address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
  address constant daiAddress = address(0x6B175474E89094C44Da98b954EedeAC495271d0F);

  CurveCryptoSwap constant curveTriCrypto = CurveCryptoSwap(curveTriCryptoAddress);
  CurveStableSwap constant curve3Pool = CurveStableSwap(curve3PoolAddress);

  Weth constant weth = Weth(wethAddress);
  IERC20 constant usdt = IERC20(usdtAddress);

  // constructor(address fmProxy) {
  //   owner = msg.sender;
  //   freeMarketProxy = fmProxy;
  // }

  function createUserProxy() public {
    address a = eternalStorageAddress;
    EternalStorage es = EternalStorage(a);
    bytes32 key = keccak256(abi.encodePacked('userProxies', msg.sender));
    address currentAddress = es.getAddress(key);
    require(currentAddress == address(0x0000000000000000), 'user proxy already exists');
    UserProxy newUserProxy = new UserProxy(msg.sender, frontDoorAddress);
    address userProxyAddress = address(newUserProxy);
    es.setAddress(key, userProxyAddress);
  }

  function getKey() public view returns (bytes32) {
    return keccak256(abi.encodePacked('userProxies', msg.sender));
  }

  function getUserProxy() public view returns (address) {
    EternalStorage eternalStorage = EternalStorage(eternalStorageAddress);
    bytes32 key = keccak256(abi.encodePacked('userProxies', msg.sender));
    return eternalStorage.getAddress(key);
    // return eternalStorageAddress;
  }

  function executeWorkflow(uint256[] calldata args) external payable {
    // uint256 amount = 10000000000000000;
    // function(uint256, uint256[] calldata) returns (uint256, uint256)[4] memory stepFuncs = [
    //   ethToWeth,
    //   curveTriCryptoPoolSwap,
    //   curve3PoolSwap,
    //   wormhole
    // ];

    // the first arg is the starting amount
    uint256 nextAmount = args[0];
    uint16 argsIndex = 1;
    while (argsIndex < args.length) {
      // consume the next arg as the step index (stepId)
      // invoke the step, passing in the next amount and a slice of args
      // uint256 nextStepIndex = args[argsIndex++];
      // (uint256 argsConsumed, uint256 outcomeAmount) = stepFuncs[nextStepIndex](nextAmount, args[argsIndex:]);
      (uint256 argsConsumed, uint256 outcomeAmount) = getStepFunc(args[argsIndex++])(nextAmount, args[argsIndex:]);
      argsIndex += uint16(argsConsumed);
      nextAmount = outcomeAmount;
    }
  }

  function ethToWeth(uint256 amount, uint256[] calldata args) public payable returns (uint16, uint256) {
    weth.deposit{value: amount}();
    return (0, amount);
  }

  function curveTriCryptoPoolSwap(uint256 amount, uint256[] calldata args) internal returns (uint16, uint256) {
    // (IERC20 fromToken, IERC20 toToken) = getCurveFromAndTo(curveTriCryptoAddress, args[0], args[1]);
    approveCurveToken(curveTriCryptoAddress, args[0], amount);
    // fromToken.approve(curveTriCryptoAddress, amount);
    IERC20 toToken = getCurveErc20(curveTriCryptoAddress, args[1]);
    uint256 beforeAmount = toToken.balanceOf(address(this));
    CurveCryptoSwap(curveTriCryptoAddress).exchange(args[0], args[1], amount, 1);
    uint256 afterAmount = toToken.balanceOf(address(this));
    return (2, afterAmount - beforeAmount);
  }

  // function getTriCryptoTokenAddress(uint256 coinIndex) internal view returns (address) {
  //   CurveCryptoSwap c = CurveCryptoSwap(curveTriCryptoAddress);
  //   return c.coins(coinIndex);
  //   // if (coinIndex == 0) {
  //   //   return usdtAddress;
  //   // } else if (coinIndex == 1) {
  //   //   return wbtcAddress;
  //   // } else {
  //   //   return wethAddress;
  //   // }
  // }

  function curve3PoolSwap(uint256 amount, uint256[] calldata args) internal returns (uint16, uint256) {
    (IERC20 fromToken, IERC20 toToken) = getCurveFromAndTo(curveTriCryptoAddress, args[0], args[1]);
    fromToken.approve(curve3PoolAddress, amount);
    uint256 beforeAmount = toToken.balanceOf(address(this));
    CurveStableSwap(curveTriCryptoAddress).exchange(int128(int256(args[0])), int128(int256(args[1])), amount, 1);
    uint256 afterAmount = toToken.balanceOf(address(this));
    return (2, amount);
  }

  function approveCurveToken(
    address curveContractAddress,
    uint256 index,
    uint256 amount
  ) internal {
    CurveStableSwap pool = CurveStableSwap(curveContractAddress);
    IERC20(pool.coins(index)).approve(curveContractAddress, amount);
  }

  function getCurveErc20(address curveContractAddress, uint256 index) internal returns (IERC20) {
    CurveStableSwap pool = CurveStableSwap(curveContractAddress);
    return IERC20(pool.coins(index));
  }

  // function get3PoolTokenAddress(uint256 coinIndex) internal view returns (address) {
  //   CurveStableSwap c = CurveStableSwap(curve3PoolAddress);
  //   return c.coins(coinIndex);
  //   // if (coinIndex == 0) {
  //   //   return daiAddress;
  //   // } else if (coinIndex == 1) {
  //   //   return usdcAddress;
  //   // } else {
  //   //   return usdtAddress;
  //   // }
  // }

  // function curveCrytpoSwap(
  //   address contractAddress,
  //   uint256 amount,
  //   uint256 fromIndex,
  //   uint256 toIndex
  // ) internal {
  //   CurveCryptoSwap curveContract = CurveCryptoSwap(contractAddress);
  //   curveContract.exchange(fromIndex, toIndex, amount, 1);
  // }

  // function curveStableSwapFunc(
  //   address contractAddress,
  //   uint256 amount,
  //   uint256 fromIndex,
  //   uint256 toIndex
  // ) internal {
  //   CurveStableSwap curveContract = CurveStableSwap(contractAddress);
  //   curveContract.exchange(int128(int256(fromIndex)), int128(int256(toIndex)), amount, 1);
  // }

  // function doCurveSwap(
  //   uint256 amount,
  //   address curveContractAddress,
  //   uint256 fromIndex,
  //   uint256 toIndex,
  //   function(address, uint256, uint256, uint256) swapFunc
  // ) internal returns (uint256, uint256) {
  //   // any abi will work because the sig for coins is the same accross all
  //   // CurveStableSwap pool = CurveStableSwap(curveContractAddress);
  //   (address fromTokenAddress, address toTokenAddress) = getCurveFromAndTo(curveContractAddress, fromIndex, toIndex);

  //   // IERC20 fromErc20 = IERC20(fromTokenAddress);
  //   // TODO eraseme
  //   // uint256 fromAmount = fromErc20.balanceOf(address(this));
  //   // bool approveResult = fromErc20.approve(curveContractAddress, 0);
  //   // approveResult = fromErc20.approve(curveContractAddress, amount);
  //   require(IERC20(fromTokenAddress).approve(curveContractAddress, amount));

  //   uint256 amountBefore = IERC20(toTokenAddress).balanceOf(address(this));
  //   swapFunc(curveContractAddress, amount, fromIndex, toIndex);
  //   uint256 amountAfter = IERC20(toTokenAddress).balanceOf(address(this));
  //   return (2, amountAfter - amountBefore);
  // }

  // function getCurveFromAndToAddresses(
  //   address curveContractAddress,
  //   uint256 fromIndex,
  //   uint256 toIndex
  // ) internal returns (address, address) {
  //   CurveStableSwap pool = CurveStableSwap(curveContractAddress);
  //   // address fromTokenAddress = pool.coins(fromIndex);
  //   // address toTokenAddress = pool.coins(toIndex);
  //   return (pool.coins(fromIndex), pool.coins(toIndex));
  // }
  function getCurveFromAndTo(
    address curveContractAddress,
    uint256 fromIndex,
    uint256 toIndex
  ) internal view returns (IERC20, IERC20) {
    CurveStableSwap pool = CurveStableSwap(curveContractAddress);
    address fromTokenAddress = pool.coins(fromIndex);
    address toTokenAddress = pool.coins(toIndex);
    return (IERC20(fromTokenAddress), IERC20(toTokenAddress));
  }

  // function appr

  function wormhole(uint256 amount, uint256[] calldata _args) internal returns (uint16, uint256) {
    return (0, 0);
  }

  function approveErc20(address tokenAddress, uint256 amount) internal {
    IERC20 erc20 = IERC20(tokenAddress);
    bool approveResult = erc20.approve(curveTriCryptoAddress, amount);
    require(approveResult);
  }

  function getStepFunc(uint256 index) private returns (function(uint256, uint256[] calldata) returns (uint16, uint256)) {
    if (index < 2) {
      if (index == 0) {
        return ethToWeth;
      } else {
        return curveTriCryptoPoolSwap;
      }
    } else {
      if (index == 2) {
        return curve3PoolSwap;
      } else {
        return wormhole;
      }
    }
  }
}
