// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '../Ownable.sol';

/// @dev Actions will typically have 1 external contract address that they interact with,
/// and it may vary by chain, so make it changeable.
contract ActionBase is Ownable {
  // address public contractAddress;
  // function setContractAddress(address newContractAddress) external onlyOwner {
  //   contractAddress = newContractAddress;
  // }
}
