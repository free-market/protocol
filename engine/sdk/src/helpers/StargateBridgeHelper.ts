import {
  StepIds,
  IStargateRouter__factory,
  StargateBridge as StargateBridgeEvm,
  StargateBridgeAction__factory,
  StargateChainIds,
  WorkflowRunner__factory,
  getBridgePayload,
  ADDRESS_ZERO,
  AssetType,
  StargateBridge as EvmStargateBridge,
  StargatePoolIds,
} from '@freemarket/evm'
import { Memoize } from 'typescript-memoize'
import type { AssetAmount, Chain, StargateBridge } from '../model'
import { AbstractStepHelper } from './AbstractStepHelper'
import { absoluteAmountToString } from './utils'
import rootLogger from 'loglevel'
import type { NextSteps } from './IStepHelper'
import assert from '../utils/assert'
import type { EncodedWorkflowStep } from '../EncodedWorkflow'
import { WORKFLOW_END_STEP_ID } from '../runner/constants'
import { sdkAssetAmountToEvmInputAmount } from '../utils/evm-encoding-utils'
import type { AssetReference } from '../model/AssetReference'
import Big from 'big.js'
import { Web3Provider } from '@ethersproject/providers'

const log = rootLogger.getLogger('StargateBridgeHelper')

interface StargateFeeArgs {
  srcFrontDoorAddress: string
  dstAddress: string
  dstGasForCall: string
  dstNativeAmount?: string
  payload: string
  dstChainId: number
}

export interface StargateMinAmountOutArgs {
  frontDoorAddress: string
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

  async getRemittance(stepConfig: StargateBridge): Promise<AssetAmount> {
    const dstAddress = await this.getStargateBridgeActionAddress()
    const dstChainId = await this.getStargateChainId(stepConfig.destinationChain)
    const srcFrontDoorAddress = await this.getFrontDoorAddress()
    if (!stepConfig.destinationGasUnits) {
      throw new Error('stargate automatic destination chain gas estimation not implemented, please provide a value for destinationGasUnits')
    }

    const payload = await this.getPayload(stepConfig)

    const requiredNative = await this.getStargateRequiredNative({
      srcFrontDoorAddress,
      dstAddress,
      dstGasForCall: absoluteAmountToString(stepConfig.destinationGasUnits),
      dstNativeAmount: absoluteAmountToString(stepConfig.destinationGasUnits),
      payload: payload.continuationWorkflow,
      dstChainId,
    })
    return {
      asset: { type: 'native' },
      amount: requiredNative,
    }
  }

  @Memoize()
  private async getStargateChainId(chain: Chain): Promise<number> {
    if (await this.isTestNet()) {
      switch (chain) {
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
  }

  // TODO probably not needed
  // @Memoize()
  // private async getStargateChainId() {
  //   const chainId = await this.getChainId()
  //   switch (chainId) {
  //     case 1:
  //       return StargateChainIds.Ethereum
  //     case 5:
  //       return StargateChainIds.GoerliEthereum
  //     case 56:
  //       return StargateChainIds.BNB
  //     case 97:
  //       return StargateChainIds.GoerliBNB
  //     case 42161:
  //       return StargateChainIds.Arbitrum
  //     case 421613:
  //       return StargateChainIds.GoerliArbitrum
  //     case 137:
  //       return StargateChainIds.Polygon
  //     case 80001:
  //       return StargateChainIds.GoerliPolygon
  //     case 43114:
  //       return StargateChainIds.Avalanche
  //     case 43113:
  //       return StargateChainIds.GoerliAvalanche
  //     case 10:
  //       return StargateChainIds.Optimism
  //     case 420:
  //       return StargateChainIds.GoerliOptimism
  //     case 250:
  //       return StargateChainIds.Fantom
  //     case 4002:
  //       return StargateChainIds.GoerliFantom
  //     default:
  //       throw new Error('unknown stargate chainId for ' + chainId)
  //   }
  // }

  @Memoize()
  private async getStargateBridgeActionAddress(): Promise<string> {
    assert(this.standardProvider)
    const frontDoorAddress = await this.getFrontDoorAddress()
    return StargateBridgeEvm.getStargateBridgeActionAddress(frontDoorAddress, this.standardProvider)
  }

  @Memoize()
  async getStargateBridgeActionAddressForChain(chain: Chain): Promise<string> {
    const stdProvider = this.runner.getProvider(chain)
    const ethersProvider = new Web3Provider(stdProvider)
    const frontDoorAddress = await this.getFrontDoorAddressForChain(chain)
    const runner = WorkflowRunner__factory.connect(frontDoorAddress, ethersProvider)
    const sgBridgeActionAddr = await runner.getStepAddress(StepIds.stargateBridge)
    log.debug(`StargateBridgeAction for chain '${chain}' is ${sgBridgeActionAddr}`)
    return sgBridgeActionAddr
  }

  @Memoize()
  async getStargateRouterAddress(frontDoorAddress: string): Promise<string> {
    assert(this.ethersProvider)
    const runner = WorkflowRunner__factory.connect(frontDoorAddress, this.ethersProvider)
    const sgBridgeActionAddr = await runner.getStepAddress(StepIds.stargateBridge)
    const sgBridgeAction = StargateBridgeAction__factory.connect(sgBridgeActionAddr, this.ethersProvider)
    const sgRouterAddr = await sgBridgeAction.stargateRouterAddress()
    log.debug(`StargateRouter address=${sgRouterAddr}`)
    return sgRouterAddr
  }

  async getStargateRequiredNative(args: StargateFeeArgs): Promise<string> {
    assert(this.ethersProvider)
    log.debug(`getting stargate required gas=${args.dstGasForCall} airdrop=${args.dstNativeAmount}`)
    const sgRouterAddress = await this.getStargateRouterAddress(args.srcFrontDoorAddress)
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

  private async getPayload(stepConfig: StargateBridge): Promise<{ nonce: string; continuationWorkflow: string }> {
    assert(stepConfig.nextStepId)
    if (stepConfig.nextStepId === WORKFLOW_END_STEP_ID) {
      return { nonce: '0', continuationWorkflow: '0x' }
    }
    const encodedTargetSegment = await this.runner.encodeSegment(stepConfig.nextStepId, stepConfig.destinationChain)
    const { nonce, encodedWorkflow } = getBridgePayload(stepConfig.destinationUserAddress, encodedTargetSegment)
    log.debug(`generated payload for stepId '${stepConfig.stepId}' nonce='${nonce}'`)
    return { nonce, continuationWorkflow: encodedWorkflow }
  }

  private async getBridgeTargetAddress(stepConfig: StargateBridge): Promise<string> {
    assert(stepConfig.nextStepId)
    if (stepConfig.nextStepId === WORKFLOW_END_STEP_ID) {
      return stepConfig.destinationUserAddress
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

  async encodeWorkflowStep(chain: Chain, stepConfig: StargateBridge): Promise<EncodedWorkflowStep> {
    assert(stepConfig.nextStepId)
    assert(typeof stepConfig.inputAsset !== 'string')
    const [transferInputAsset, { nonce, continuationWorkflow }, targetAddress, dstChainId] = await Promise.all([
      sdkAssetAmountToEvmInputAmount(stepConfig.inputAsset, chain, this.runner),
      this.getPayload(stepConfig),
      this.getBridgeTargetAddress(stepConfig),
      this.getStargateChainId(stepConfig.destinationChain),
    ])

    // TODO how to handle this
    const stargateRequiredNative = 1000000
    let minAmountOut: string
    if (typeof stepConfig.inputAsset.amount === 'string' && stepConfig.inputAsset.amount.endsWith('%')) {
      log.warn('stargate maxSlippagePercent not yet supported for relative input amounts, defaulting minAmountOut to 1')
      minAmountOut = '1'
    } else {
      const p = stepConfig.maxSlippagePercent / 100
      const x = new Big(1 - p)
      const amount = new Big(stepConfig.inputAsset.amount.toString())
      minAmountOut = amount.mul(x).toFixed(0)
    }
    // TODO required native

    // TODO auto gas estimates
    if (!stepConfig.destinationGasUnits) {
      throw new Error('auto gas estimates are not supported')
    }

    const paymentAsset = {
      asset: {
        assetType: AssetType.Native,
        assetAddress: ADDRESS_ZERO,
      },
      amount: stargateRequiredNative.toString(),
      amountIsPercent: false,
    }

    const srcPoolId = StargateBridgeHelper.getPoolId(stepConfig.inputAsset.asset)
    const dstPoolId = stepConfig.outputAsset ? StargateBridgeHelper.getPoolId(stepConfig.inputAsset.asset) : srcPoolId
    return {
      stepId: StepIds.stargateBridge,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [transferInputAsset, paymentAsset],
      outputAssets: [], // no output assets, the input asset is transferred from the caller
      data: EvmStargateBridge.encodeStargateBridgeArgs({
        dstActionAddress: targetAddress, // who initially gets the money and gets invoked by SG
        dstUserAddress: stepConfig.destinationUserAddress, // dstUserAddress, // who gets the money after the continuation workflow completes
        srcPoolId,
        dstPoolId,
        dstChainId: dstChainId.toString(),
        dstGasForCall: stepConfig.destinationGasUnits.toString(), // gas units (not wei or gwei)
        dstNativeAmount: stepConfig.destinationAdditionalNative ? stepConfig.destinationAdditionalNative.toString() : '0',
        minAmountOut: minAmountOut,
        minAmountOutIsPercent: false,
        continuationWorkflow: continuationWorkflow,
        nonce,
      }),
    }
  }
  // static async getStargateMinAmountOut(args: StargateMinAmountOutArgs): Promise<string> {
  //   const sgFeeLibraryAddr = await StargateBridge.getFeeLibraryAddress(args.frontDoorAddress, args.srcPoolId, args.provider)
  //   const ethersProvider = new Web3Provider(args.provider)
  //   const sgFeeLibrary = IStargateFeeLibrary__factory.connect(sgFeeLibraryAddr, ethersProvider)
  //   const swapObj = await sgFeeLibrary.getFees(args.srcPoolId, args.dstPoolId, args.dstChainId, args.dstUserAddress, args.inputAmount)
  //   const [_amount, eqFee, eqReward, lpFee, protocolFee, _lkbRemove] = swapObj
  //   const inputAmount = BigNumber.from(args.inputAmount)
  //   const minAmountOut = inputAmount
  //     .sub(BigNumber.from(eqFee))
  //     .sub(BigNumber.from(protocolFee))
  //     .sub(BigNumber.from(lpFee))
  //     .add(BigNumber.from(eqReward))
  //     .mul(StargateBridge.fudgeFactorNumerator)
  //     .div(StargateBridge.fudgeFactorDenominator)

  //   log.debug(`stargate minAmountOut=${minAmountOut}`)
  //   return minAmountOut.toString()
  // }
}
