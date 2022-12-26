// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '../ActionBase.sol';
import '../../IWorkflowStep.sol';
import '../../EternalStorage.sol';
import './Weth.sol';

contract WrappedEtherBase is ActionBase {
  constructor(address storageAddress, address wethContractAddress) ActionBase(storageAddress, wethContractAddress) {}

  function getContractAddressConfigKey() internal pure override returns (string memory) {
    return 'config.wrappedether.address';
  }

  /// @dev convenience function to get the foreign contract
  function getWeth() internal view returns (Weth) {
    return Weth(getContractAddress());
  }
}
