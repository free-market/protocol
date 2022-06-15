// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../thirdParty/CurveCryptoSwap.sol';
import '../thirdParty/CurveStableSwap.sol';

library Curve {
  address constant curveTriCryptoAddress = address(0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5);
  address constant curve3PoolAddress = address(0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5);

  function curveTriCryptoPoolSwap(uint256 amount, uint256[] calldata args) internal returns (uint16, uint256) {
    approveCurveToken(curveTriCryptoAddress, args[0], amount);
    IERC20 toToken = getCurveErc20(curveTriCryptoAddress, args[1]);
    uint256 beforeAmount = toToken.balanceOf(address(this));
    CurveCryptoSwap(curveTriCryptoAddress).exchange(args[0], args[1], amount, 1);
    uint256 afterAmount = toToken.balanceOf(address(this));
    return (2, afterAmount - beforeAmount);
  }

  function curve3PoolSwap(uint256 amount, uint256[] calldata args) internal returns (uint16, uint256) {
    approveCurveToken(curveTriCryptoAddress, args[0], amount);
    IERC20 toToken = getCurveErc20(curveTriCryptoAddress, args[1]);
    uint256 beforeAmount = toToken.balanceOf(address(this));
    CurveStableSwap(curveTriCryptoAddress).exchange(int128(int256(args[0])), int128(int256(args[1])), amount, 1);
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
    IERC20 token = IERC20(tokenAddress);
    token.approve(curveContractAddress, amount);
  }

  function getCurveErc20(address curveContractAddress, uint256 index) internal view returns (IERC20) {
    CurveStableSwap pool = CurveStableSwap(curveContractAddress);
    address tokenAddress = pool.coins(index);
    return IERC20(tokenAddress);
  }
}
