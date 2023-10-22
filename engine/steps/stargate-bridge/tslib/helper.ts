import { AbstractStepHelper, getBridgePayload } from '@freemarket/step-sdk'
import { defaultAbiCoder } from '@ethersproject/abi'
import {
  ADDRESS_ZERO,
  assert,
  EncodedWorkflowStep,
  EncodingContext,
  AssetAmount,
  absoluteAmountToString,
  Chain,
  getEthersProvider,
  NextSteps,
  WORKFLOW_END_STEP_ID,
  AssetReference,
  sdkAssetAmountToEvmInputAmount,
  EvmAssetType,
  sdkAssetAndAmountToEvmInputAmount,
  RemittanceInfo,
  TEN_BIG,
  ContinuationInfo,
  EncodeContinuationResult,
  Memoize,
  AssetInfoService,
} from '@freemarket/core'
import rootLogger from 'loglevel'
import type { StargateBridge } from './model'
import { StargateChainIds } from './StargateChainIds'
import { WorkflowRunner__factory } from '@freemarket/runner'
import {
  IStargateFactory__factory,
  IStargateFeeLibrary__factory,
  IStargatePool__factory,
  IStargateRouter__factory,
  StargateBridgeAction__factory,
} from '../typechain-types'
import { StargatePoolIds } from './StargatePoolIds'
import Big from 'big.js'
import type { StargateBridgeActionArgs } from './StargateBridgeActionArgs'
import { BigNumber } from 'ethers'
import { EIP1193Provider } from 'hardhat/types'

export const STEP_TYPE_ID_STARGATE_BRIDGE = 101

// const log = rootLogger.getLogger('StargateBridgeHelper')
const log = rootLogger

interface StargateFeeArgs {
  dstAddress: string
  dstGasForCall: string
  dstNativeAmount: string
  payload: string
  dstChainId: number
}

export interface StargateMinAmountOutArgs {
  inputAmount: string
  dstChainId: number
  srcPoolId: number
  dstPoolId: number
  dstUserAddress: string
}

export class StargateBridgeHelper extends AbstractStepHelper<StargateBridge> {
  requiresRemittance(_stepConfig: StargateBridge) {
    return true
  }

  @Memoize(stepConfig => JSON.stringify(stepConfig))
  async getRemittance(stepConfig: StargateBridge): Promise<RemittanceInfo> {
    const dstAddress = await this.getStargateBridgeActionAddress()
    const dstChainId = await this.getStargateChainId(stepConfig.destinationChain)
    if (!stepConfig.destinationGasUnits) {
      throw new Error('stargate automatic destination chain gas estimation not implemented, please provide a value for destinationGasUnits')
    }

    const payload = await this.getPayload(stepConfig, ADDRESS_ZERO)

    const requiredNative = await this.getStargateRequiredNative({
      dstAddress,
      dstGasForCall: absoluteAmountToString(stepConfig.destinationGasUnits),
      dstNativeAmount: stepConfig.destinationAdditionalNative ? absoluteAmountToString(stepConfig.destinationAdditionalNative) : '0',
      payload: payload.continuationWorkflow,
      dstChainId,
    })
    assert(stepConfig.remittanceSource === 'caller' || stepConfig.remittanceSource === 'workflow')
    return {
      asset: { type: 'native' },
      amount: new Big(requiredNative).div(TEN_BIG.pow(18)).toFixed(),
      source: stepConfig.remittanceSource,
    }
  }

  @Memoize()
  private async getStargateChainId(chain: Chain): Promise<number> {
    if (await this.instance.isTestNet()) {
      switch (chain) {
        case 'hardhat':
        case 'ethereum':
          return StargateChainIds.GoerliEthereum
        case 'arbitrum':
          return StargateChainIds.GoerliArbitrum
        case 'avalanche':
          return StargateChainIds.GoerliAvalanche
        case 'binance':
          return StargateChainIds.GoerliBinance
        case 'fantom':
          return StargateChainIds.GoerliFantom
        case 'optimism':
          return StargateChainIds.GoerliOptimism
        case 'polygon':
          return StargateChainIds.GoerliPolygon
      }
    } else {
      switch (chain) {
        case 'hardhat':
        case 'ethereum':
          return StargateChainIds.Ethereum
        case 'arbitrum':
          return StargateChainIds.Arbitrum
        case 'avalanche':
          return StargateChainIds.Avalanche
        case 'binance':
          return StargateChainIds.Binance
        case 'fantom':
          return StargateChainIds.Fantom
        case 'optimism':
          return StargateChainIds.Optimism
        case 'polygon':
          return StargateChainIds.Polygon
      }
    }
    throw new Error(`Unsupported chain ${chain}`)
  }

  @Memoize()
  private async getStargateBridgeActionAddress(): Promise<string> {
    assert(this.ethersProvider)
    const frontDoorAddress = await this.getFrontDoorAddress()
    const runner = WorkflowRunner__factory.connect(frontDoorAddress, this.ethersProvider)
    const stargateBridgeActionAddress = await runner.getStepAddress(STEP_TYPE_ID_STARGATE_BRIDGE)
    return stargateBridgeActionAddress
  }

  @Memoize()
  async getStargateBridgeActionAddressForChain(chain: Chain): Promise<string> {
    const stdProvider = this.instance.getProvider(chain)
    const ethersProvider = getEthersProvider(stdProvider)
    const frontDoorAddress = await this.instance.getFrontDoorAddressForChain(chain)
    const runner = WorkflowRunner__factory.connect(frontDoorAddress, ethersProvider)
    const sgBridgeActionAddr = await runner.getStepAddress(STEP_TYPE_ID_STARGATE_BRIDGE)
    log.debug(`StargateBridgeAction for chain '${chain}' is ${sgBridgeActionAddr}`)
    return sgBridgeActionAddr
  }

  @Memoize()
  async getStargateRouterAddress(): Promise<string> {
    assert(this.ethersProvider)
    const sgBridgeActionAddr = await this.getStargateBridgeActionAddress()
    const sgBridgeAction = StargateBridgeAction__factory.connect(sgBridgeActionAddr, this.ethersProvider)
    const sgRouterAddr = await sgBridgeAction.stargateRouterAddress()
    log.debug(`StargateRouter address=${sgRouterAddr}`)
    return sgRouterAddr
  }

  @Memoize(args => JSON.stringify(args))
  async getStargateRequiredNative(args: StargateFeeArgs): Promise<string> {
    assert(this.ethersProvider)
    // prettier-ignore
    log.debug(`getting stargate required native gas=${args.dstGasForCall} airdrop=${args.dstNativeAmount} payloadLen=${args.payload.length}`)
    const sgRouterAddress = await this.getStargateRouterAddress()
    const sgRouter = IStargateRouter__factory.connect(sgRouterAddress, this.ethersProvider)
    const quoteResult = await sgRouter.quoteLayerZeroFee(args.dstChainId, 1, args.dstAddress, args.payload, {
      dstGasForCall: args.dstGasForCall,
      dstNativeAmount: args.dstNativeAmount ?? 0,
      dstNativeAddr: args.dstAddress,
    })
    const stargateFee = quoteResult['0']
    log.debug(`stargate required native=${stargateFee.toString()}`)
    return stargateFee.toString()
  }

  getPossibleNextSteps(stepConfig: StargateBridge): NextSteps | null {
    assert(stepConfig.nextStepId)
    if (stepConfig.nextStepId === WORKFLOW_END_STEP_ID) {
      return null
    }
    return {
      sameChain: [],
      differentChains: [
        {
          chain: stepConfig.destinationChain,
          stepId: stepConfig.nextStepId,
        },
      ],
    }
  }

  private async getPayload(
    stepConfig: StargateBridge,
    userAddress: string,
    isDebug?: boolean
  ): Promise<{ nonce: string; continuationWorkflow: string }> {
    const targetChainUserAddress = stepConfig.destinationUserAddress ?? userAddress
    assert(stepConfig.nextStepId)
    if (stepConfig.nextStepId === WORKFLOW_END_STEP_ID) {
      return { nonce: '0', continuationWorkflow: '0x' }
    }
    const encodedTargetSegment = await this.instance.encodeSegment(
      stepConfig.nextStepId,
      stepConfig.destinationChain,
      targetChainUserAddress,
      ADDRESS_ZERO, // TODO implement me
      !!isDebug
    )
    log.debug('encoded target segment:\n' + JSON.stringify(encodedTargetSegment, null, 2))
    const { nonce, encodedWorkflow } = getBridgePayload(targetChainUserAddress, encodedTargetSegment)
    log.debug(`generated payload for stepId '${stepConfig.stepId}' nonce='${nonce}'`)
    return { nonce, continuationWorkflow: encodedWorkflow }
  }

  private async getBridgeTargetAddress(context: EncodingContext<StargateBridge>): Promise<string> {
    const { stepConfig, userAddress } = context
    assert(stepConfig.nextStepId)
    if (stepConfig.nextStepId === WORKFLOW_END_STEP_ID) {
      return stepConfig.destinationUserAddress ?? userAddress
    }
    return this.getStargateBridgeActionAddressForChain(stepConfig.destinationChain)
  }

  static getPoolId(assetRef: AssetReference): string {
    assert(typeof assetRef !== 'string')
    if (assetRef.type === 'native') {
      // TODO not sure if this is required when transferring native
      return StargatePoolIds['ETH'].toString()
    }
    const rv = StargatePoolIds[assetRef.symbol]
    return rv.toString()
  }

  async encodeWorkflowStep(context: EncodingContext<StargateBridge>): Promise<EncodedWorkflowStep> {
    const { stepConfig, chain, userAddress } = context
    assert(stepConfig.nextStepId)
    assert(typeof stepConfig.inputAsset !== 'string')
    // const [transferInputAsset, payload, targetAddress, dstChainId, remittance] = await Promise.all([
    //   sdkAssetAndAmountToEvmInputAmount(
    //     stepConfig.inputAsset,
    //     stepConfig.inputAmount,
    //     chain,
    //     this.instance,
    //     context.stepConfig.inputSource === 'caller'
    //   ),
    //   this.getPayload(stepConfig, userAddress),
    //   this.getBridgeTargetAddress(context),
    //   this.getStargateChainId(stepConfig.destinationChain),
    //   this.getRemittance(context.stepConfig),
    // ])
    const transferInputAsset = await sdkAssetAndAmountToEvmInputAmount(
      stepConfig.inputAsset,
      stepConfig.inputAmount,
      chain,
      this.instance,
      context.stepConfig.inputSource === 'caller'
    )
    const payload = await this.getPayload(stepConfig, userAddress, context.isDebug)
    const targetAddress = await this.getBridgeTargetAddress(context)
    const dstChainId = await this.getStargateChainId(stepConfig.destinationChain)
    const remittance = await this.getRemittance(context.stepConfig)

    log.debug('dstChainId', dstChainId)

    const { nonce, continuationWorkflow } = payload

    const stargateRequiredNative = new Big(remittance.amount.toString()).mul(TEN_BIG.pow(18)).toString()
    let minAmountOut: string
    if (typeof stepConfig.inputAmount === 'string' && stepConfig.inputAmount.endsWith('%')) {
      log.warn('stargate maxSlippagePercent not yet supported for relative input amounts, defaulting minAmountOut to 1')
      minAmountOut = '1'
    } else {
      const maxSlippagePercent =
        typeof stepConfig.maxSlippagePercent === 'number' ? stepConfig.maxSlippagePercent : parseFloat(stepConfig.maxSlippagePercent)
      const p = maxSlippagePercent / 100
      const x = new Big(1 - p)
      const amount = new Big(stepConfig.inputAmount.toString())
      minAmountOut = amount.mul(x).toFixed(0)
    }
    // TODO required native

    // TODO auto gas estimates
    if (!stepConfig.destinationGasUnits) {
      throw new Error('auto gas estimates are not supported')
    }

    const paymentAsset = {
      asset: {
        assetType: EvmAssetType.Native,
        assetAddress: ADDRESS_ZERO,
      },
      amount: stargateRequiredNative.toString(),
      amountIsPercent: false,
      sourceIsCaller: false,
    }

    const srcPoolId = StargateBridgeHelper.getPoolId(stepConfig.inputAsset)
    const dstPoolId = stepConfig.outputAsset ? StargateBridgeHelper.getPoolId(stepConfig.inputAsset) : srcPoolId

    const minOut =
      context.chain === stepConfig.destinationChain
        ? '0'
        : await this.getStargateMinAmountOut({
            dstChainId,
            dstPoolId: parseInt(dstPoolId),
            srcPoolId: parseInt(srcPoolId),
            dstUserAddress: targetAddress,
            inputAmount: transferInputAsset.amount.toString(),
          })

    minAmountOut = minOut

    const sgArgs: StargateBridgeActionArgs = {
      dstActionAddress: targetAddress, // who initially gets the money and gets invoked by SG
      dstUserAddress: stepConfig.destinationUserAddress ?? context.userAddress, // dstUserAddress, // who gets the money after the continuation workflow completes
      srcPoolId,
      dstPoolId,
      dstChainId: dstChainId.toString(),
      dstGasForCall: stepConfig.destinationGasUnits.toString(), // gas units (not wei or gwei)
      dstNativeAmount: stepConfig.destinationAdditionalNative ? stepConfig.destinationAdditionalNative.toString() : '0',
      minAmountOut: minAmountOut,
      minAmountOutIsPercent: false,
      continuationWorkflow: continuationWorkflow,
      nonce,
      includeContinuationWorkflowInEvent: !!context.isDebug,
    }
    log.debug(`stargate args:\n${JSON.stringify(sgArgs, null, 2)}`)

    return {
      stepTypeId: STEP_TYPE_ID_STARGATE_BRIDGE,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [transferInputAsset, paymentAsset],
      argData: StargateBridgeHelper.encodeStargateBridgeArgs(sgArgs),
      nextStepIndex: -1,
    }
  }

  @Memoize()
  async getFactoryAddress(): Promise<string> {
    const sgRouterAddress = await this.getStargateRouterAddress()
    assert(this.ethersProvider)
    const sgRouter = IStargateRouter__factory.connect(sgRouterAddress, this.ethersProvider)
    const sgFactoryAddr = await sgRouter.factory()
    log.debug(`StargateFactory address=${sgFactoryAddr}`)
    return sgFactoryAddr
  }

  @Memoize()
  async getPoolAddress(poolId: number): Promise<string> {
    const sgFactoryAddr = await this.getFactoryAddress()
    assert(this.ethersProvider)
    const sgFactory = IStargateFactory__factory.connect(sgFactoryAddr, this.ethersProvider)
    const sgPoolAddr = await sgFactory.getPool(poolId)
    log.debug(`StargatePool address=${sgPoolAddr}`)
    return sgPoolAddr
  }

  @Memoize()
  private async getFeeLibraryAddress(srcPoolId: number): Promise<string> {
    const sgPoolAddr = await this.getPoolAddress(srcPoolId)
    assert(this.ethersProvider)
    const sgPool = IStargatePool__factory.connect(sgPoolAddr, this.ethersProvider)
    const sgFeeLibraryAddr = await sgPool.feeLibrary()
    log.debug(`StargateFeeLibrary address=${sgFeeLibraryAddr}`)
    return sgFeeLibraryAddr
  }
  async getStargateMinAmountOut(args: StargateMinAmountOutArgs): Promise<string> {
    assert(this.ethersProvider)
    const sgFeeLibraryAddr = await this.getFeeLibraryAddress(args.srcPoolId)
    const sgFeeLibrary = IStargateFeeLibrary__factory.connect(sgFeeLibraryAddr, this.ethersProvider)
    const swapObj = await sgFeeLibrary.getFees(args.srcPoolId, args.dstPoolId, args.dstChainId, args.dstUserAddress, args.inputAmount)
    const [_amount, eqFee, eqReward, lpFee, protocolFee, _lkbRemove] = swapObj
    const inputAmount = BigNumber.from(args.inputAmount)
    const minAmountOut = inputAmount
      .sub(BigNumber.from(eqFee))
      .sub(BigNumber.from(protocolFee))
      .sub(BigNumber.from(lpFee))
      .add(BigNumber.from(eqReward))
      .mul(StargateBridgeHelper.fudgeFactorNumerator)
      .div(StargateBridgeHelper.fudgeFactorDenominator)

    log.debug(`stargate minAmountOut=${minAmountOut}`)
    return minAmountOut.toString()
  }
  private static fudgeFactorNumerator = BigNumber.from(999)
  private static fudgeFactorDenominator = BigNumber.from(1000)

  static encodeStargateBridgeArgs(args: StargateBridgeActionArgs) {
    const encodedArgs = defaultAbiCoder.encode(
      [
        `tuple(
        address dstActionAddress,
        address dstUserAddress,
        uint16 dstChainId,
        uint256 srcPoolId,
        uint256 dstPoolId,
        uint256 dstGasForCall,
        uint256 dstNativeAmount,
        uint256 minAmountOut,
        bool minAmountOutIsPercent,
        bytes continuationWorkflow,
        uint256 nonce,
        bool includeContinuationWorkflowInEvent
      )`,
      ],
      [args]
    )
    return encodedArgs
  }
  async getAddAssetInfo(stepConfig: StargateBridge): Promise<AssetAmount[]> {
    const ret: AssetAmount[] = []
    if (stepConfig.remittanceSource === 'caller') {
      const remittance = await this.getRemittance(stepConfig)
      ret.push({
        asset: {
          type: 'native',
        },
        amount: remittance.amount,
      })
    }
    assert(typeof stepConfig.inputAsset !== 'string')
    if (stepConfig.inputSource === 'caller') {
      ret.push({
        asset: stepConfig.inputAsset,
        amount: stepConfig.inputAmount,
      })
    }
    return ret
  }

  async encodeContinuation(continuationInfo: ContinuationInfo): Promise<EncodeContinuationResult> {
    // get the dest token address
    assert(continuationInfo.expectedAssets.length === 1)
    const assetAmount = continuationInfo.expectedAssets[0]
    const asset = await this.instance.dereferenceAsset(assetAmount.asset, continuationInfo.targetChain)
    assert(asset.type === 'fungible-token')
    const destTokenAddress = asset.chains[continuationInfo.targetChain]?.address
    assert(destTokenAddress)

    // get the stargate router address
    const stdProvider = this.instance.getProvider(continuationInfo.targetChain)
    const ethersProvider = getEthersProvider(stdProvider)
    const frontDoorAddr = await this.instance.getFrontDoorAddressForChain(continuationInfo.targetChain)
    const runner = WorkflowRunner__factory.connect(frontDoorAddr, ethersProvider)
    const stepAddress = await runner.getStepAddress(STEP_TYPE_ID_STARGATE_BRIDGE)
    const step = StargateBridgeAction__factory.connect(stepAddress, ethersProvider)
    const stargateRouterAddress = await step.stargateRouterAddress()

    // encode the function call
    const encodedCall = step.interface.encodeFunctionData('sgReceive', [
      0,
      '0x',
      0,
      destTokenAddress,
      assetAmount.amount,
      continuationInfo.continuationWorkflow,
    ])
    return {
      callData: encodedCall,
      fromAddress: stargateRouterAddress,
      toAddress: stepAddress,
      startAssets: [
        {
          address: destTokenAddress,
          amount: assetAmount.amount.toString(),
        },
      ],
    }
  }
}
