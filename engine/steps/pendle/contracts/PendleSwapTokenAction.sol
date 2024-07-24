// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import '@freemarket/core/contracts/IWorkflowStep.sol';
import '@freemarket/step-sdk/contracts/IWeth.sol';
import '@freemarket/core/contracts/model/AssetAmount.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

// import 'hardhat/console.sol';
import './AbstractPendleAction.sol';

contract PendleSwapToken is AbstractPendleAction, IWorkflowStep {
  using LibStepResultBuilder for StepResultBuilder;

  constructor(address _router, address _routerStatic) AbstractPendleAction(_router, _routerStatic) {}

  // trick to reduce stack size
  struct LocalVars {
    IStandardizedYield SY;
    IPPrincipalToken PT;
    IPYieldToken YT;
    address targetToken;
    uint targetTokenBefore;
    uint targetTokenReceived;
  }

  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    bytes calldata argData,
    address
  ) public payable override returns (WorkflowStepResult memory) {
    require(inputAssetAmounts.length == 1, 'maxOneInput');
    require(inputAssetAmounts[0].asset.assetType == AssetType.ERC20, 'onlyErc20Input');
    require(inputAssetAmounts[0].asset.assetAddress != address(0), 'onlyErc20Input');

    //console.log('entering DepositEthForStEthAction');
    PendleSwapTokenParams memory params = abi.decode(argData, (PendleSwapTokenParams));
    LocalVars memory locals;
    (locals.SY, locals.PT, locals.YT) = IPMarket(params.market).readTokens();
    require(locals.SY.yieldToken() == inputAssetAmounts[0].asset.assetAddress, 'incompatibleMarket');

    LimitOrderData memory emptyLimit;
    TokenInput memory tokenInput = createTokenInputStruct(inputAssetAmounts[0].asset.assetAddress, inputAssetAmounts[0].amount);
    IERC20(inputAssetAmounts[0].asset.assetAddress).approve(address(router), inputAssetAmounts[0].amount);

    if (params.pendleFunction == PendleFunction.SwapTokenForPt) {
      locals.targetToken = address(locals.PT);
      locals.targetTokenBefore = locals.PT.balanceOf(address(this));
      router.swapExactTokenForPt(address(this), params.market, params.minTokenOutput, defaultApprox(), tokenInput, emptyLimit);
    } else if ((params.pendleFunction == PendleFunction.SwapTokenForYt)) {
      locals.targetToken = address(locals.YT);
      locals.targetTokenBefore = locals.YT.balanceOf(address(this));
      router.swapExactTokenForYt(address(this), params.market, params.minTokenOutput, defaultApprox(), tokenInput, emptyLimit);
    }

    // console.log("SY PT YT ", locals.SY.balanceOf(address(this)), locals.PT.balanceOf(address(this)), locals.YT.balanceOf(address(this)));
    locals.targetTokenReceived = IERC20(locals.targetToken).balanceOf(address(this)) - locals.targetTokenBefore;

    return
      LibStepResultBuilder
        .create(1, 1)
        .addInputAssetAmount(inputAssetAmounts[0])
        .addOutputAssetAmount(
          AssetAmount({asset: Asset({assetType: AssetType.ERC20, assetAddress: locals.targetToken}), amount: locals.targetTokenReceived})
        )
        .result;
  }
}
