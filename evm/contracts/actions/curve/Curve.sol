// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './CurveCryptoSwap.sol';
import './CurveStableSwap.sol';
import '../../thirdParty/USDT.sol';

library Curve {
  address constant curveTriCryptoAddress = address(0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5);
  address constant curve3PoolAddress = address(0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7);
  address constant curve3PoolTokenAddress = address(0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490);
  address constant usdtAddress = address(0xdAC17F958D2ee523a2206206994597C13D831ec7);

  function curveTriCryptoPoolSwap(
    address fromToken,
    uint256 amount,
    uint256[] calldata args
  ) internal returns (address, uint256) {
    approveCurveToken(curveTriCryptoAddress, fromToken, amount);
    address toTokenAddress = getCurveErc20Address(curveTriCryptoAddress, args[1]);
    IERC20 toToken = IERC20(toTokenAddress);
    uint256 beforeAmount = toToken.balanceOf(address(this));
    CurveCryptoSwap(curveTriCryptoAddress).exchange(args[0], args[1], amount, 1);
    uint256 afterAmount = toToken.balanceOf(address(this));
    return (toTokenAddress, afterAmount - beforeAmount);
  }

  function curve3PoolSwap(
    address fromToken,
    uint256 amount,
    uint256[] calldata args
  ) internal returns (address, uint256) {
    approveCurveToken(curve3PoolAddress, fromToken, amount);
    address toTokenAddress = getCurveErc20Address(curve3PoolAddress, args[1]);
    IERC20 toToken = IERC20(toTokenAddress);
    uint256 beforeAmount = toToken.balanceOf(address(this));
    CurveStableSwap(curve3PoolAddress).exchange(int128(int256(args[0])), int128(int256(args[1])), amount, 1);
    uint256 afterAmount = toToken.balanceOf(address(this));
    return (toTokenAddress, afterAmount - beforeAmount);
  }

  function curve3PoolAddLiquidity(
    address fromToken,
    uint256 amount,
    uint256[] calldata args
  ) internal returns (address, uint256) {
    // args[0] is the index of the coin
    approveCurveToken(curve3PoolAddress, fromToken, amount);
    CurveStableSwap pool = CurveStableSwap(curve3PoolAddress);
    uint256[3] memory amounts = [uint256(0), 0, 0];
    amounts[args[0]] = amount;
    uint256 balanceBefore = IERC20(curve3PoolTokenAddress).balanceOf(address(this));
    pool.add_liquidity(amounts, 1);
    uint256 balanceAfter = IERC20(curve3PoolTokenAddress).balanceOf(address(this));
    return (curve3PoolTokenAddress, balanceAfter - balanceBefore);
  }

  function approveCurveToken(
    address curveContractAddress,
    address tokenAddress,
    uint256 amount
  ) internal {
    if (tokenAddress == usdtAddress) {
      UsdtApprove token = UsdtApprove(tokenAddress);
      token.approve(curveContractAddress, amount);
    } else {
      IERC20 token = IERC20(tokenAddress);
      token.approve(curveContractAddress, amount);
    }
  }

  function getCurveErc20Address(address curveContractAddress, uint256 index) internal view returns (address) {
    CurveStableSwap pool = CurveStableSwap(curveContractAddress);
    return pool.coins(index);
    // return IERC20(tokenAddress);
  }
}
