// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import './aave-interfaces/IAaveV3Pool.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
// import '../../mocks/MockToken.sol';
import '@freemarket/step-sdk/contracts/TestErc20.sol';

contract MockAavePool is IAaveV3Pool {
  TestErc20 public immutable mockAToken = new TestErc20('aUSDC', 6);

  function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external {
    // take the asset being supplied, and mint some aToken (equal amounts of each)
    IERC20(asset).transferFrom(msg.sender, address(this), amount);
    mockAToken.mint(onBehalfOf, amount);
    emit Supply(asset, msg.sender, onBehalfOf, amount, referralCode);
  }

  function getReserveData(address) external view returns (ReserveData memory) {
    return ReserveData(ReserveConfigurationMap(0), 0, 0, 0, 0, 0, 0, 0, address(mockAToken), address(0), address(0), address(0), 0, 9, 0);
  }

  function getUserAccountData(
    address user
  )
    external
    view
    override
    returns (
      uint256 totalCollateralBase,
      uint256 totalDebtBase,
      uint256 availableBorrowsBase,
      uint256 currentLiquidationThreshold,
      uint256 ltv,
      uint256 healthFactor
    )
  {}

  function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external override {}

  function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) external override returns (uint256) {}

  function getUserConfiguration(address user) external view override returns (UserConfigurationMap memory) {}

  function setUserUseReserveAsCollateral(address asset, bool useAsCollateral) external override {}

  function ADDRESSES_PROVIDER() external override returns (IPoolAddressesProvider) {}

  function withdraw(address asset, uint256 amount, address to) external override returns (uint256) {}
}
