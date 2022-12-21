// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Ownable {
  address payable public owner;
  // uint256 public constant OWNER_SLOT = 0x02016836a56b71f0d02689e69e326f4f4c1b9057164ef592671cf0d37c8040c0; // keccak256('owner')

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // function getOwner() public view returns (address x) {
  //   assembly {
  //     x := sload(OWNER_SLOT)
  //   }
  // }

  event LogNewOwner(address sender, address newOwner);

  constructor(address initialOwner) {
    owner = payable(initialOwner);
    // address sender = msg.sender;
    // assembly {
    //   sstore(OWNER_SLOT, sender)
    // }
  }

  function setOwner(address payable newOwner) public onlyOwner {
    require(newOwner != address(0));
    owner = newOwner;
    // assembly {
    //   sstore(OWNER_SLOT, newOwner)
    // }
    emit LogNewOwner(msg.sender, newOwner);
  }
}
