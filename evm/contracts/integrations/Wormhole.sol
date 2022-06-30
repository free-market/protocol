// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface TokenBridge {
  function transferTokens(
    address token,
    uint256 amount,
    uint16 recipientChain,
    bytes32 recipient,
    uint256 arbiterFee,
    uint32 nonce
  ) external payable returns (uint64);
}

library Wormhole {
  // goerli
  uint16 constant chainId = 2;
  // address constant coreBridgeAddress = 0x706abc4E45D419950511e474C7B9Ed348A4a716c;
  address constant tokenBridgeAddress = 0xF890982f9310df57d00f659cf4fd87e65adEd8d7;

  // ropsten
  // uint16 constant chainId = 10001;
  // address constant coreBridgeAddress = 0x210c5F5e2AF958B4defFe715Dc621b7a3BA888c5;
  // address constant tokenBridgeAddress = 0xF174F9A837536C449321df1Ca093Bb96948D5386;

  // mainnet
  // uint16 constant chainId = 2;
  // address constant coreBridgeAddress = 0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B;
  // address constant tokenBridgeAddress = 0x3ee18B2214AFF97000D974cf647E7C347E8fa585;

  // args[0] is recipientChain
  // args[1] is recipient
  // args[2] is nonce
  function wormholeTransferTokens(
    address fromToken,
    uint256 amount,
    uint256[] calldata args
  ) internal returns (address, uint256) {
    require(IERC20(fromToken).approve(tokenBridgeAddress, amount), 'approval for wormhole token bridge failed');
    TokenBridge(tokenBridgeAddress).transferTokens(fromToken, amount, uint16(args[0]), bytes32(args[1]), 0, uint32(args[2]));
    return (address(0), 0);
  }
}
