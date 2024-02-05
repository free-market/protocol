// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.18;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

/// An ERC20 contract with external mint and burn, useful for testing.
contract TestErc20 is ERC20 {
  uint8 public immutable _decimals;

  constructor(string memory _symbol, uint8 dec) ERC20(_symbol, _symbol) {
    _decimals = dec;
  }

  function decimals() public view virtual override returns (uint8) {
    return _decimals;
  }

  function mint(address account, uint256 amount) external {
    _mint(account, amount);
  }

  function burn(address account, uint256 amount) external {
    _burn(account, amount);
  }
}
