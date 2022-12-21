// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '../ActionBase.sol';
import '../../IWorkflowStep.sol';

contract WrappedEtherBase is Ownable {
  uint256 constant WRAPPED_ETHER_CONTRACT_ADDRESS_SLOT = 0x55e6829e8b6fbe8dc8eb835b4f9eadf07d1d40958a7ff920c846fdf43bcc359a; // keccak256('wrapped.ether.contract.address')

  constructor(address wethContractAddress) {
    // stored immutably
    assembly {
      sstore(WRAPPED_ETHER_CONTRACT_ADDRESS_SLOT, wethContractAddress)
    }
  }

  function getContractAddress() public view returns (address x) {
    assembly {
      x := sload(WRAPPED_ETHER_CONTRACT_ADDRESS_SLOT)
    }
  }
}
