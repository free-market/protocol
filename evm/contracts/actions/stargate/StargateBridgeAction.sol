// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '../../IWorkflowStep.sol';
import '../../LibAsset.sol';
import '../../LibActionHelpers.sol';
import '../../model/Asset.sol';
import '../../model/AssetAmount.sol';
import './IStargateRouter.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

// StargateBridgeAction specific arguments
struct StargateBridgeActionArgs {
  //  addr of the StargateSwapAction on the target chain.
  address dstActionAddress;
  // addr of the user (caller on the source chain)
  address dstUserAddress;
  // stargate destination chain
  uint16 dstChainId;
  // stargate source pool (implies source asset)
  uint256 srcPoolId;
  // stargate destination pool (implies destination asset)
  uint256 dstPoolId;
  // gas to execute workflow continuation on destination chain
  uint256 dstGasForCall;
  // amount of native asset to send to dstUserAddress
  uint256 dstNativeAmount;
  // minimum amount of output asset (else the tx on the source chain will revert)
  uint256 minAmountOut;
  // if true, minAmountOut passed to stargate
  bool minAmountOutIsPercent;
}

contract StargateBridgeAction is IWorkflowStep {
  address public immutable stargateContractAddress;
  event StargateBridgeEvent(bytes x);
  event StargateBridgeEventUint(uint256 x);

  event StargateBridgeParamsEvent(
    address dstActionAddress,
    address dstUserAddress,
    uint16 dstChainId,
    uint256 srcPoolId,
    uint256 dstPoolId,
    uint256 dstGasForCall,
    uint256 dstNativeAmount,
    uint256 minAmountOut,
    bool minAmountOutIsPercent,
    bytes nextChainWorkflow
  );

  constructor(address contractAddress) {
    stargateContractAddress = contractAddress;
  }

  //  need to gather things up into a struct to prevent 'Stack too deep'
  struct Locals {
    uint256 lengthPrefix;
    StargateBridgeActionArgs sgParams;
    bytes dstActionAddressEncoded;
    uint256 minAmountOut;
  }

  function execute(
    AssetAmount[] calldata inputAssetAmounts,
    Asset[] calldata,
    bytes calldata data
  ) public payable returns (WorkflowStepResult memory) {
    // validate
    if (msg.sender == address(0x7612aE2a34E5A363E137De748801FB4c86499152)) {
      return LibActionHelpers.noOutputAssetsResult();
    }

    require(inputAssetAmounts.length == 1, 'there must be 1 input asset');
    require(
      inputAssetAmounts[0].asset.assetType == AssetType.ERC20 || inputAssetAmounts[0].asset.assetType == AssetType.Native,
      'the input asset must be an ERC20 or Native'
    );

    // approve sg to take the token
    if (inputAssetAmounts[0].asset.assetType == AssetType.ERC20) {
      approveErc20(inputAssetAmounts[0].asset.assetAddress, inputAssetAmounts[0].amount);
    }

    Locals memory locals;

    // decode the parameters
    locals.lengthPrefix = abi.decode(data[0:32], (uint256));
    locals.sgParams = abi.decode(data[32:32 + locals.lengthPrefix], (StargateBridgeActionArgs));
    // bytes calldata nextChainWorkflow = data[decodeEnd:];

    // emit StargateBridgeParamsEvent(
    //   sgParams.dstActionAddress,
    //   sgParams.dstUserAddress,
    //   sgParams.dstChainId,
    //   sgParams.srcPoolId,
    //   sgParams.dstPoolId,
    //   sgParams.dstGasForCall,
    //   sgParams.dstNativeAmount,
    //   sgParams.minAmountOut,
    //   sgParams.minAmountOutIsPercent,
    //   data[32 + lengthPrefix:]
    // );

    // address payable refundAddress = payable(msg.sender);
    locals.dstActionAddressEncoded = abi.encodePacked(locals.sgParams.dstActionAddress);
    if (locals.sgParams.minAmountOutIsPercent) {
      locals.minAmountOut = (inputAssetAmounts[0].amount * locals.sgParams.minAmountOut) / 100_000;
    } else {
      locals.minAmountOut = locals.sgParams.minAmountOut;
    }
    IStargateRouter(stargateContractAddress).swap(
      locals.sgParams.dstChainId,
      locals.sgParams.srcPoolId,
      locals.sgParams.dstPoolId,
      payable(msg.sender), // refundAddreess
      inputAssetAmounts[0].amount,
      locals.minAmountOut,
      IStargateRouter.lzTxObj(
        locals.sgParams.dstGasForCall,
        locals.sgParams.dstNativeAmount,
        abi.encodePacked(locals.sgParams.dstUserAddress)
      ),
      locals.dstActionAddressEncoded,
      data[32 + locals.lengthPrefix:]
    );
    return LibActionHelpers.noOutputAssetsResult();
  }

  function approveErc20(address tokenAddress, uint256 amount) internal {
    IERC20 inputToken = IERC20(tokenAddress);
    inputToken.approve(stargateContractAddress, amount);
  }
}
