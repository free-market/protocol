// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../thirdParty/CurveCryptoSwap.sol';
import '../thirdParty/CurveStableSwap.sol';

// import '../thirdParty/Usdt.sol';

interface UsdtApprove {
  function approve(address _spender, uint256 _value) external;
}

library Curve {
  address constant curveTriCryptoAddress = address(0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5);
  address constant curve3PoolAddress = address(0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7);
  address constant usdtAddress = address(0xdAC17F958D2ee523a2206206994597C13D831ec7);

  function curveTriCryptoPoolSwap(uint256 amount, uint256[] calldata args) internal returns (uint16, uint256) {
    approveCurveToken(curveTriCryptoAddress, args[0], amount);
    IERC20 toToken = getCurveErc20(curveTriCryptoAddress, args[1]);
    uint256 beforeAmount = toToken.balanceOf(address(this));
    CurveCryptoSwap(curveTriCryptoAddress).exchange(args[0], args[1], amount, 1);
    uint256 afterAmount = toToken.balanceOf(address(this));
    return (2, afterAmount - beforeAmount);
  }

  function curve3PoolSwap(uint256 amount, uint256[] calldata args) internal returns (uint16, uint256) {
    approveCurveToken(curve3PoolAddress, args[0], amount);
    IERC20 toToken = getCurveErc20(curve3PoolAddress, args[1]);
    uint256 beforeAmount = toToken.balanceOf(address(this));
    CurveStableSwap(curve3PoolAddress).exchange(int128(int256(args[0])), int128(int256(args[1])), amount, 1);
    uint256 afterAmount = toToken.balanceOf(address(this));
    return (2, afterAmount - beforeAmount);
  }

  function approveCurveToken(
    address curveContractAddress,
    uint256 index,
    uint256 amount
  ) internal {
    CurveStableSwap pool = CurveStableSwap(curveContractAddress);
    address tokenAddress = pool.coins(index);
    if (tokenAddress == usdtAddress) {
      UsdtApprove token = UsdtApprove(tokenAddress);
      token.approve(curveContractAddress, amount);
    } else {
      IERC20 token = IERC20(tokenAddress);
      token.approve(curveContractAddress, amount);
    }
  }

  function getCurveErc20(address curveContractAddress, uint256 index) internal view returns (IERC20) {
    CurveStableSwap pool = CurveStableSwap(curveContractAddress);
    address tokenAddress = pool.coins(index);
    return IERC20(tokenAddress);
  }
}
