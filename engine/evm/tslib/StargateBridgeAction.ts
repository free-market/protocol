import { defaultAbiCoder } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { Web3Provider } from '@ethersproject/providers'
import { EIP1193Provider } from 'eip1193-provider'
import log from 'loglevel'
import {
  IStargateFactory__factory,
  IStargateFeeLibrary__factory,
  IStargatePool__factory,
  IStargateRouter__factory,
  StargateBridgeAction__factory,
  WorkflowRunner__factory,
} from '../types/ethers-contracts'
import { StepIds } from './StepIds'

export const StargateChainIds: { [index: string]: number } = {
  Ethereum: 101,
  BNB: 102,
  Avalanche: 106,
  Polygon: 109,
  Arbitrum: 110,
  Optimism: 111,
  Fantom: 112,
  GoerliEthereum: 10121,
  GoerliArbitrum: 10143,
  GoerliOptimism: 10132,
  GoerliBNB: 10102,
  GoerliAvalanche: 10106,
  GoerliMumbai: 10109,
  GoerliFantom: 10112,
} as const

export const StargatePoolIds: { [index: string]: number } = {
  USDC: 1,
  USDT: 2,
  DAI: 3,
  BUSD: 5,
  FRAX: 7,
  USDD: 11,
  ETH: 13,
  sUSD: 14,
  LUSD: 15,
  MAI: 16,
  METIS: 17,
  metisUSDT: 19,
} as const

export interface StargateMinAmountOutArgs {
  provider: EIP1193Provider
  frontDoorAddress: string
  inputAmount: string
  dstChainId: number
  srcPoolId: number
  dstPoolId: number
  dstUserAddress: string
}

export interface StargateFeeArgs {
  provider: EIP1193Provider
  frontDoorAddress: string
  dstAddress: string
  dstGasForCall: string
  dstNativeAmount?: string
  payload: string
  dstChainId: number
}

export interface StargateBridgeActionArgs {
  dstActionAddress: string
  dstUserAddress: string
  dstChainId: string
  srcPoolId: string
  dstPoolId: string
  dstGasForCall: string
  dstNativeAmount: string
  minAmountOut: string
  minAmountOutIsPercent: boolean
  continuationWorkflow: string
}

export class StargateBridge {
  static async getFactoryAddress(frontDoorAddress: string, provider: EIP1193Provider): Promise<string> {
    const ethersProvider = new Web3Provider(provider)
    const sgRouterAddress = await StargateBridge.getStargateRouterAddress(frontDoorAddress, provider)
    const sgRouter = IStargateRouter__factory.connect(sgRouterAddress, ethersProvider)
    const sgFactoryAddr = await sgRouter.factory()
    log.debug(`StargateFactory address=${sgFactoryAddr}`)
    return sgFactoryAddr
  }
  static async getPoolAddress(frontDoorAddress: string, poolId: number, provider: EIP1193Provider): Promise<string> {
    const ethersProvider = new Web3Provider(provider)
    const sgFactoryAddr = await this.getFactoryAddress(frontDoorAddress, provider)
    const sgFactory = IStargateFactory__factory.connect(sgFactoryAddr, ethersProvider)
    const sgPoolAddr = await sgFactory.getPool(poolId)
    log.debug(`StargatePool address=${sgPoolAddr}`)
    return sgPoolAddr
  }

  static async getStargateRouterAddress(frontDoorAddress: string, provider: EIP1193Provider): Promise<string> {
    const ethersProvider = new Web3Provider(provider)
    const runner = WorkflowRunner__factory.connect(frontDoorAddress, ethersProvider)
    const sgBridgeActionAddr = await runner.getStepAddress(StepIds.stargateBridge)
    log.debug(`StargateBridgeAction address=${sgBridgeActionAddr}`)
    const sgBridgeAction = StargateBridgeAction__factory.connect(sgBridgeActionAddr, ethersProvider)
    const sgRouterAddr = await sgBridgeAction.stargateRouterAddress()
    log.debug(`StargateRouter address=${sgRouterAddr}`)
    return sgRouterAddr
  }

  static async getFeeLibraryAddress(frontDoorAddress: string, srcPoolId: number, provider: EIP1193Provider): Promise<string> {
    const ethersProvider = new Web3Provider(provider)
    const sgPoolAddr = await StargateBridge.getPoolAddress(frontDoorAddress, srcPoolId, provider)
    const sgPool = IStargatePool__factory.connect(sgPoolAddr, ethersProvider)
    const sgFeeLibraryAddr = await sgPool.feeLibrary()
    log.debug(`StargateFeeLibrary address=${sgFeeLibraryAddr}`)
    return sgFeeLibraryAddr
  }

  // fudge factor:  multiply minAmountOut by 999/1000 = 1 / 1000 = 0.1%
  private static fudgeFactorNumerator = BigNumber.from(999)
  private static fudgeFactorDenominator = BigNumber.from(1000)

  static async getStargateMinAmountOut(args: StargateMinAmountOutArgs): Promise<string> {
    const sgFeeLibraryAddr = await StargateBridge.getFeeLibraryAddress(args.frontDoorAddress, args.srcPoolId, args.provider)
    const ethersProvider = new Web3Provider(args.provider)
    const sgFeeLibrary = IStargateFeeLibrary__factory.connect(sgFeeLibraryAddr, ethersProvider)
    const swapObj = await sgFeeLibrary.getFees(args.srcPoolId, args.dstPoolId, args.dstChainId, args.dstUserAddress, args.inputAmount)
    const [_amount, eqFee, eqReward, lpFee, protocolFee, _lkbRemove] = swapObj
    const inputAmount = BigNumber.from(args.inputAmount)
    const minAmountOut = inputAmount
      .sub(BigNumber.from(eqFee))
      .sub(BigNumber.from(protocolFee))
      .sub(BigNumber.from(lpFee))
      .add(BigNumber.from(eqReward))
      .mul(StargateBridge.fudgeFactorNumerator)
      .div(StargateBridge.fudgeFactorDenominator)

    log.debug(`stargate minAmountOut=${minAmountOut}`)
    return minAmountOut.toString()
  }

  static async getStargateRequiredNative(args: StargateFeeArgs): Promise<string> {
    log.debug(`getting stargate required gas=${args.dstGasForCall} airdrop=${args.dstNativeAmount}`)
    const sgRouterAddress = await StargateBridge.getStargateRouterAddress(args.frontDoorAddress, args.provider)
    const ethersProvider = new Web3Provider(args.provider)
    const sgRouter = IStargateRouter__factory.connect(sgRouterAddress, ethersProvider)
    const quoteResult = await sgRouter.quoteLayerZeroFee(args.dstChainId, 1, args.dstAddress, args.payload, {
      dstGasForCall: args.dstGasForCall,
      dstNativeAmount: args.dstNativeAmount ?? 0,
      dstNativeAddr: args.dstAddress,
    })
    const stargateFee = quoteResult['0']
    log.debug(`stargate required native=${stargateFee.toString()}`)
    return stargateFee.toString()
  }

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
        bytes continuationWorkflow
      )`,
      ],
      [args]
    )
    return encodedArgs
  }

  static async getStargateBridgeActionAddress(frontDoorAddress: string, provider: EIP1193Provider): Promise<string> {
    const ethersProvider = new Web3Provider(provider)
    const runner = WorkflowRunner__factory.connect(frontDoorAddress, ethersProvider)
    const stargateBridgeActionAddress = await runner.getStepAddress(StepIds.stargateBridge)
    return stargateBridgeActionAddress
  }
}
