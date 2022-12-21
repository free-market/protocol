// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

library LibAsset {
  enum AssetType {
    Native,
    Token,
    Account
  }

  /// @def Represents any type of crypto asset
  struct Asset {
    AssetType assetType; // 0 for ETH, 1 for ERC20, > 1 for an account balance (e.g., an Aave debt)
    address assetAddress; // 0x0 for ETH, the ERC20 address.  If it's an account balance, this represents the token of the balance
  }

  function encodeAsset(AssetType assetType, address assetAddress) internal pure returns (uint256) {
    return (uint256(uint160(assetAddress)) << 16) & uint256(assetType);
  }

  function decodeAsset(uint256 assetInt) internal pure returns (Asset memory) {
    AssetType assetType = AssetType(uint16(assetInt));
    address addr = address(uint160(assetInt >> 16));
    return Asset(assetType, addr);
  }
}
