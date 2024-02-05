// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import '@freemarket/core/contracts/IWorkflowStep.sol';
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

// AaveBorrowAction specific arguments
struct AaveRepayActionArgs {
  uint256 interestRateMode;
}

contract AaveRepayAction is IWorkflowStep {
  address public immutable poolAddressProviderAddress;
  address public immutable wethAddress;

  constructor(address _poolAddressProviderAddress, address _wethAddress) {
    poolAddressProviderAddress = _poolAddressProviderAddress;
    wethAddress = _wethAddress;
  }

  function execute(
    AssetAmount[] calldata inputAssets,
    bytes calldata argData,
    address userAddress
  ) public payable returns (WorkflowStepResult memory) {
    console.log('entering aave repay action');
    require(inputAssets.length == 1, 'there must be exactly 1 input asset');

    address assetAddress;
    if (inputAssets[0].asset.assetType == AssetType.Native) {
      console.log('input asset is native, wrapping');
      IWeth(wethAddress).deposit{value: inputAssets[0].amount}();
      assetAddress = wethAddress;
    } else {
      assetAddress = inputAssets[0].asset.assetAddress;
    }
    AaveRepayActionArgs memory args = abi.decode(argData, (AaveRepayActionArgs));
    console.log('interestRateMode', args.interestRateMode);
    console.log('assetAddress', assetAddress);
    console.log('amount', inputAssets[0].amount);

    IPoolAddressesProvider poolAddressProvider = IPoolAddressesProvider(poolAddressProviderAddress);
    address poolAddress = poolAddressProvider.getPool();
    IPool pool = IPool(poolAddress);

    IERC20(assetAddress).approve(poolAddress, inputAssets[0].amount);
    pool.repay(assetAddress, inputAssets[0].amount, args.interestRateMode, userAddress);
    return LibStepResultBuilder.create(1, 0).addInputAssetAmount(inputAssets[0]).result;
  }
}
