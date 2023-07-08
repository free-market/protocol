// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/step-sdk/contracts/LibActionHelpers.sol';
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

struct Signature {
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
  Signature[] delegateSignatures;
}

contract AaveBorrowAction is IWorkflowStep {
  // prices from Aave oracle have 8 decimals
  // so to convert to float we need to divide by 1e8
  uint256 internal constant AAVE_ORACLE_PRICE_DIVISOR_UINT = 100000000;
  uint256 internal constant MAX_UINT256 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

  address public immutable poolAddressProviderAddress;
  address public immutable wethAddress;
  bytes16 internal immutable AAVE_ORACLE_PRICE_DIVISOR_FLOAT;
  bytes16 internal immutable TEN_FLOAT;

  constructor(address _poolAddressProviderAddress, address _wethAddress) {
    poolAddressProviderAddress = _poolAddressProviderAddress;
    wethAddress = _wethAddress;
    AAVE_ORACLE_PRICE_DIVISOR_FLOAT = ABDKMathQuad.fromUInt(AAVE_ORACLE_PRICE_DIVISOR_UINT);
    TEN_FLOAT = ABDKMathQuad.fromUInt(10);
  }

  function execute(AssetAmount[] calldata, bytes calldata argData) public payable returns (WorkflowStepResult memory) {
    console.log('entering aave borrow action');

    // Locals memory locals;

    AaveBorrowActionArgs memory args = abi.decode(argData, (AaveBorrowActionArgs));

    console.log('amount', args.amount);
    console.log('interestRateMode', args.interestRateMode);
    console.log('asset.address', args.asset.assetAddress);
    console.log('amountIsPercent', args.amountIsPercent);
    console.log('referralCode', args.referralCode);
    console.log('args.delegateSignatures.length', args.delegateSignatures.length);

    IPoolAddressesProvider poolAddressProvider = IPoolAddressesProvider(poolAddressProviderAddress);
    address poolAddress = poolAddressProvider.getPool();

    IPool pool = IPool(poolAddress);
    uint256 borrowAmount = args.amount;
    console.log('borrowAmount', borrowAmount);

    // {
    //   // IPriceOracleSentinel priceOracleSentinel = IPriceOracleSentinel(poolAddressProvider.getPriceOracleSentinel());
    //   // console.log('isBorrowAllowed', priceOracleSentinel.isBorrowAllowed());
    //   // require(priceOracleSentinel.isBorrowAllowed(), 'borrow is not allowed');
    // }

    address assetAddress = args.asset.assetType == AssetType.ERC20 ? args.asset.assetAddress : wethAddress;
    if (args.amountIsPercent) {
      borrowAmount = computeRelativeAmount(args.amount, assetAddress, pool, poolAddressProvider);
    }
    console.log('borrowAmount', borrowAmount);

    ICreditDelegationToken debtToken;
    {
      DataTypes.ReserveData memory reserveData = pool.getReserveData(assetAddress);
      if (args.interestRateMode == 1) {
        debtToken = ICreditDelegationToken(reserveData.stableDebtTokenAddress);
      } else {
        debtToken = ICreditDelegationToken(reserveData.variableDebtTokenAddress);
      }
    }
    // the first sig is to delegate max uint to this
    console.log('borrowAllowance', debtToken.borrowAllowance(msg.sender, address(this)));
    console.log('delegating max');
    debtToken.delegationWithSig(
      msg.sender,
      address(this),
      MAX_UINT256,
      MAX_UINT256,
      args.delegateSignatures[0].v,
      args.delegateSignatures[0].r,
      args.delegateSignatures[0].s
    );

    console.log('borrowAllowance', debtToken.borrowAllowance(msg.sender, address(this)));

    console.log('borrowing this:', address(this));
    console.log('borrowing asset:', assetAddress);
    console.log('borrowing amount:', borrowAmount);
    console.log('borrowing interestRateMode:', args.interestRateMode);
    console.log('borrowing referralCode:', args.referralCode);
    console.log('borrowing msg.sender (on-behalf of):', msg.sender);
    pool.borrow(assetAddress, borrowAmount, args.interestRateMode, args.referralCode, msg.sender);

    // the second sig is to delegate 0 to this
    console.log('delegating 0');
    debtToken.delegationWithSig(
      msg.sender,
      address(this),
      0,
      MAX_UINT256,
      args.delegateSignatures[1].v,
      args.delegateSignatures[1].r,
      args.delegateSignatures[1].s
    );
    console.log('borrowAllowance', debtToken.borrowAllowance(msg.sender, address(this)));

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
    IPoolAddressesProvider poolAddressProvider
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
        msg.sender
      );
    }
    console.log('availableBorrowsBase', availableBorrowsBase);

    // take percentage of borrowing power (in base currency)
    uint256 borrowAmountBase = LibPercent.percentageOf(availableBorrowsBase, borrowAmountPercent);
    console.log('relative borrowAmountBase', borrowAmountBase);

    // ask the price oracle for the price of the asset to be borrowed
    uint256 assetPrice;
    {
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

  // there are just here for unit testing to enable weth.withdraw()
  receive() external payable {}

  fallback() external payable {}
}
