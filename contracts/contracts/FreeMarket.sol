// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import './AddressSet.sol';
import './Ownable.sol';

contract FreeMarket is Ownable {

  event Deposit(address indexed sender, uint256 amount, address token);

  address public busStop;
  
  AddressSet.Set supportedERC20Tokens;

  constructor() {
    owner = msg.sender;
  }

  function setBusStop(address newBusStop) public onlyOwner {
    busStop = newBusStop;
  }

  function getSupportedERC20Tokens() public view returns(address[] memory) {
    return supportedERC20Tokens.values;
  }

  function addSupportedERC20Token(address erc20TokenAddress) public onlyOwner {
    AddressSet.add(supportedERC20Tokens, erc20TokenAddress);
  }

  function removeSupportedERC20Token(address erc20TokenAddress) public onlyOwner {
    AddressSet.remove(supportedERC20Tokens, erc20TokenAddress);
  }

  function deposit(address erc20TokenAddress, uint256 amount) public {
    require(AddressSet.exists(supportedERC20Tokens, erc20TokenAddress), "token not supported");
    IERC20 token = IERC20(erc20TokenAddress);
    SafeERC20.safeTransferFrom(token, msg.sender, busStop, amount);
    emit Deposit(msg.sender, amount, erc20TokenAddress);
  }
}
