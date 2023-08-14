// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/core/contracts/IWorkflowStepBeforeAll.sol';
import '@freemarket/core/contracts/IWorkflowStepAfterAll.sol';
import '@freemarket/core/contracts/model/AssetAmount.sol';
import '@freemarket/core/contracts/LibPercent.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@freemarket/step-sdk/contracts/LibStepResultBuilder.sol';
import '@freemarket/step-sdk/contracts/LibErc20.sol';
import '@freemarket/step-sdk/contracts/LibWethUtils.sol';
import '@freemarket/step-sdk/contracts/ABDKMathQuad.sol';
import '@freemarket/step-sdk/contracts/IWeth.sol';
import 'hardhat/console.sol';
import '@freemarket/core/contracts/model/WorkflowStepInputAsset.sol';
import '@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol';
import '@aave/core-v3/contracts/interfaces/IPriceOracleSentinel.sol';
import '@aave/core-v3/contracts/interfaces/IAaveOracle.sol';
import '@aave/core-v3/contracts/interfaces/IPool.sol';
import '@aave/core-v3/contracts/interfaces/ICreditDelegationToken.sol';

using LibStepResultBuilder for StepResultBuilder;
using LibErc20 for IERC20;
using ABDKMathQuad for bytes16;

struct DelegationWithSignatureArgs {
  uint256 amount;
  uint256 interestRateMode;
  address assetAddress;
  uint8 v;
  bytes32 r;
  bytes32 s;
}

// AaveBorrowAction specific arguments
struct AaveBorrowActionArgs {
  uint256 amount;
  uint256 interestRateMode;
  Asset asset;
  bool amountIsPercent;
  uint16 referralCode;
}

contract AaveBorrowAction is IWorkflowStep, IWorkflowStepBeforeAll, IWorkflowStepAfterAll {
  // prices from Aave oracle have 8 decimals
  // so to convert to float we need to divide by 1e8
  uint256 internal constant AAVE_ORACLE_PRICE_DIVISOR_UINT = 100000000;
  uint256 internal constant MAX_UINT256 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

  address public immutable poolAddressProviderAddress;
  address public immutable wethAddress;
  bytes16 internal immutable AAVE_ORACLE_PRICE_DIVISOR_FLOAT;
  bytes16 internal immutable TEN_FLOAT;

  event Eraseme(address debtToken, uint256 amount, uint256 interestRateMode, address assetAddress, uint8 v, bytes32 r, bytes32 s);

  constructor(address _poolAddressProviderAddress, address _wethAddress) {
    poolAddressProviderAddress = _poolAddressProviderAddress;
    wethAddress = _wethAddress;
    AAVE_ORACLE_PRICE_DIVISOR_FLOAT = ABDKMathQuad.fromUInt(AAVE_ORACLE_PRICE_DIVISOR_UINT);
    TEN_FLOAT = ABDKMathQuad.fromUInt(10);
  }

  function execute(AssetAmount[] calldata, bytes calldata argData, address userAddress) public payable returns (WorkflowStepResult memory) {
    console.log('entering aave borrow action');

    // Locals memory locals;

    AaveBorrowActionArgs memory args = abi.decode(argData, (AaveBorrowActionArgs));

    console.log('amount', args.amount);
    console.log('interestRateMode', args.interestRateMode);
    console.log('asset.address', args.asset.assetAddress);
    console.log('amountIsPercent', args.amountIsPercent);
    console.log('referralCode', args.referralCode);

    uint256 borrowAmount = args.amount;
    console.log('borrowAmount', borrowAmount);

    IPool pool = getPool();
    address assetAddress = args.asset.assetType == AssetType.ERC20 ? args.asset.assetAddress : wethAddress;
    if (args.amountIsPercent) {
      borrowAmount = computeRelativeAmount(args.amount, assetAddress, pool, userAddress);
    }
    console.log('borrowAmount', borrowAmount);

    console.log('borrowing this:', address(this));
    console.log('borrowing asset:', assetAddress);
    console.log('borrowing amount:', borrowAmount);
    console.log('borrowing interestRateMode:', args.interestRateMode);
    console.log('borrowing referralCode:', args.referralCode);
    console.log('borrowing userAddress (on-behalf of):', userAddress);
    pool.borrow(assetAddress, borrowAmount, args.interestRateMode, args.referralCode, userAddress);

    if (args.asset.assetType == AssetType.Native) {
      console.log('unwrapping native');
      IWeth(wethAddress).withdraw(borrowAmount);
    }

    return LibStepResultBuilder.create(0, 1).addOutputAssetAmount(AssetAmount(args.asset, borrowAmount)).result;
  }

  function computeRelativeAmount(
    uint256 borrowAmountPercent,
    address assetAddress,
    IPool pool,
    address userAddress
  ) internal view returns (uint256) {
    console.log('computing relative borrow amount');
    // get borrowing power (in base currency)
    uint256 availableBorrowsBase;
    {
      uint256 totalCollateralBase;
      uint256 totalDebtBase;
      uint256 currentLiquidationThreshold;
      uint256 ltv;
      uint256 healthFactor;

      (totalCollateralBase, totalDebtBase, availableBorrowsBase, currentLiquidationThreshold, ltv, healthFactor) = pool.getUserAccountData(
        userAddress
      );
    }
    console.log('availableBorrowsBase', availableBorrowsBase);

    // take percentage of borrowing power (in base currency)
    uint256 borrowAmountBase = LibPercent.percentageOf(availableBorrowsBase, borrowAmountPercent);
    console.log('relative borrowAmountBase', borrowAmountBase);

    // ask the price oracle for the price of the asset to be borrowed
    uint256 assetPrice;
    {
      IPoolAddressesProvider poolAddressProvider = IPoolAddressesProvider(poolAddressProviderAddress);
      IAaveOracle aaveOracle = IAaveOracle(poolAddressProvider.getPriceOracle());
      address[] memory addresses = new address[](1);
      addresses[0] = assetAddress;
      assetPrice = aaveOracle.getAssetsPrices(addresses)[0];
      console.log('assetPrice', assetPrice);
    }

    console.log('getting decimals', assetAddress);
    uint8 decimals = IERC20Metadata(assetAddress).decimals();
    console.log('decimals', decimals);

    // use floats to compute the amount of the asset to be borrowed
    bytes16 borrowAmountFloat;
    {
      bytes16 assetPriceFloat = ABDKMathQuad.fromUInt(assetPrice).div(AAVE_ORACLE_PRICE_DIVISOR_FLOAT);
      bytes16 borrowAmountBaseFloat = ABDKMathQuad.fromUInt(borrowAmountBase).div(AAVE_ORACLE_PRICE_DIVISOR_FLOAT);
      borrowAmountFloat = borrowAmountBaseFloat.div(assetPriceFloat);
    }

    bytes16 scaler = ABDKMathQuad.fromUInt(10 ** decimals);
    borrowAmountFloat = borrowAmountFloat.mul(scaler);
    return borrowAmountFloat.toUInt();
  }

  function beforeAll(bytes calldata argData, address userAddress) external payable {
    console.log('entering beforeAll');
    invokeDelegateWithSigs(argData, userAddress);
  }

  function afterAll(bytes calldata argData, address userAddress) external payable {
    console.log('entering afterAll');
    invokeDelegateWithSigs(argData, userAddress);
  }

  function invokeDelegateWithSigs(bytes calldata argData, address userAddress) internal {
    DelegationWithSignatureArgs[] memory args = abi.decode(argData, (DelegationWithSignatureArgs[]));
    IPool pool = getPool();
    for (uint256 i = 0; i < args.length; i++) {
      console.log('delegationWithSig', args[i].assetAddress);
      ICreditDelegationToken debtToken = getDebtToken(pool, args[i].assetAddress, args[i].interestRateMode);
      emit Eraseme(address(debtToken), args[i].amount, args[i].interestRateMode, args[i].assetAddress, args[i].v, args[i].r, args[i].s);
      debtToken.delegationWithSig(userAddress, address(this), args[i].amount, MAX_UINT256, args[i].v, args[i].r, args[i].s);
    }
  }

  function getPool() internal view returns (IPool) {
    IPoolAddressesProvider poolAddressProvider = IPoolAddressesProvider(poolAddressProviderAddress);
    address poolAddress = poolAddressProvider.getPool();
    return IPool(poolAddress);
  }

  function getDebtToken(IPool pool, address assetAddress, uint256 interestRateMode) internal view returns (ICreditDelegationToken) {
    DataTypes.ReserveData memory reserveData = pool.getReserveData(assetAddress);
    if (interestRateMode == 1) {
      return ICreditDelegationToken(reserveData.stableDebtTokenAddress);
    }
    return ICreditDelegationToken(reserveData.variableDebtTokenAddress);
  }

  // there are just here for unit testing to enable weth.withdraw()
  receive() external payable {}

  fallback() external payable {}
}
