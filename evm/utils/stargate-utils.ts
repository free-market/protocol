import { EIP1193Provider } from 'eip1193-provider'
import BN from 'bn.js'

import log from 'loglevel'
import FrontDoorArtifact from '../build/contracts/FrontDoor.json'
import WorkflowRunnerArtifact from '../build/contracts/WorkflowRunner.json'
import StargateBridgeActionArtifact from '../build/contracts/StargateBridgeAction.json'
import IStargateRouterArtifact from '../build/contracts/IStargateRouter.json'
import IStargateFactoryArtifact from '../build/contracts/IStargateFactory.json'
import IStargatePoolArtifact from '../build/contracts/IStargatePool.json'
import IStargateFeeLibraryArtifact from '../build/contracts/IStargateFeeLibrary.json'
import { ActionIds } from '../tslib/actionIds'

// import { Contract } from 'web3-eth-contract'
const Contract = require('web3-eth-contract')
// import { provider as Provider } from 'web3-core'

// type BNish = number | BN | string
import { FrontDoor } from '../types/web3-v1-contracts/FrontDoor'
import { WorkflowRunner } from '../types/web3-v1-contracts/WorkflowRunner'
import { StargateBridgeAction } from '../types/web3-v1-contracts/StargateBridgeAction'
import { IStargateRouter } from '../types/web3-v1-contracts/IStargateRouter'
import { IStargateFactory } from '../types/web3-v1-contracts/IStargateFactory'
import { IStargatePool } from '../types/web3-v1-contracts/IStargatePool'
import { IStargateFeeLibrary } from '../types/web3-v1-contracts/IStargateFeeLibrary'
import { WorkflowRunner__factory } from '../types/ethers-contracts'

export const StargateChainIds = {
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

export const StargatePoolIds = {
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

// fudge factor:  multiply minAmoutOut by 999/1000 = 1 / 1000 = 0.1%
const fudgeFactorNumerator = new BN(999)
const fudgeFactorDenominator = new BN(1000)

function createWeb3Contract<T>(abi: any, address: string, provider: EIP1193Provider): T {
  const c = new Contract(abi, address)
  c.setProvider(provider)
  return c as unknown as T
}

const sgFeeLibraryCache = new Map<string, string>()
const sgRouterCache = new Map<string, string>()

export async function getStargateRouterAddress(frontDoorAddress: string, provider: EIP1193Provider): Promise<string> {
  let sgRouterAddr = sgFeeLibraryCache.get(frontDoorAddress)
  if (!sgRouterAddr) {
    const frontDoor = createWeb3Contract<FrontDoor>(FrontDoorArtifact.abi as any, frontDoorAddress, provider)
    const upstream = await frontDoor.methods.getUpstream().call()
    log.debug(`frontdoor.upstream=${upstream}`)
    const runner = createWeb3Contract<WorkflowRunner>(WorkflowRunnerArtifact.abi, upstream, provider)
    const sgBridgeActionAddr = await runner.methods.getActionAddress(ActionIds.stargateBridge).call()
    log.debug(`StargateBridgeAction address=${sgBridgeActionAddr}`)
    const sgBridgeAction = createWeb3Contract<StargateBridgeAction>(StargateBridgeActionArtifact.abi, sgBridgeActionAddr, provider)
    sgRouterAddr = await sgBridgeAction.methods.stargateRouterAddress().call()
    log.debug(`IStargateRouter address=${sgRouterAddr}`)
    sgRouterCache.set(frontDoorAddress, sgRouterAddr)
  }
  return sgRouterAddr
}

async function getFeeLibraryAddress(frontDoorAddress: string, srcPoolId: number, provider: EIP1193Provider): Promise<string> {
  const key = frontDoorAddress + srcPoolId
  let sgFeeLibraryAddr = sgFeeLibraryCache.get(key)
  if (!sgFeeLibraryAddr) {
    const sgRouterAddress = await getStargateRouterAddress(frontDoorAddress, provider)
    const sgRouter = createWeb3Contract<IStargateRouter>(IStargateRouterArtifact.abi, sgRouterAddress, provider)
    const sgFactoryAddr = await sgRouter.methods.factory().call()
    const sgFactory = createWeb3Contract<IStargateFactory>(IStargateFactoryArtifact.abi, sgFactoryAddr, provider)
    const sgPoolAddr = await sgFactory.methods.getPool(srcPoolId).call()
    const sgPool = createWeb3Contract<IStargatePool>(IStargatePoolArtifact.abi, sgPoolAddr, provider)
    sgFeeLibraryAddr = await sgPool.methods.feeLibrary().call()
    sgFeeLibraryCache.set(key, sgFeeLibraryAddr)
  }
  return sgFeeLibraryAddr
}

export interface StargateMinAmountOutArgs {
  provider: EIP1193Provider
  frontDoorAddress: string
  inputAmount: BN | string
  dstChainId: number
  srcPoolId: number
  dstPoolId: number
  dstUserAddress: string
}

export async function getStargateMinAmountOut(args: StargateMinAmountOutArgs): Promise<string> {
  const sgFeeLibraryAddr = await getFeeLibraryAddress(args.frontDoorAddress, args.srcPoolId, args.provider)
  const sgFeeLibrary = createWeb3Contract<IStargateFeeLibrary>(IStargateFeeLibraryArtifact.abi, sgFeeLibraryAddr, args.provider)

  const swapObj = await sgFeeLibrary.methods
    .getFees(args.srcPoolId, args.dstPoolId, args.dstChainId, args.dstUserAddress, args.inputAmount)
    .call()

  const [_amount, eqFee, eqReward, lpFee, protocolFee, _lkbRemove] = swapObj
  const inputAmount = args.inputAmount instanceof BN ? args.inputAmount : new BN(args.inputAmount)
  const minAmountOut = inputAmount
    .sub(new BN(eqFee))
    .sub(new BN(protocolFee))
    .sub(new BN(lpFee))
    .add(new BN(eqReward))
    .mul(fudgeFactorNumerator)
    .div(fudgeFactorDenominator)

  log.debug(`stargate minAmountOut=${minAmountOut}`)
  return minAmountOut.toString()
}

export interface StargateFeeArgs {
  provider: EIP1193Provider
  frontDoorAddress: string
  dstAddress: string
  dstGasForCall: BN | string
  dstNativeAmount?: BN | string
  payload: string
  dstChainId: number
}
export async function getStargateRequiredNative(args: StargateFeeArgs): Promise<string> {
  const sgRouterAddress = await getStargateRouterAddress(args.frontDoorAddress, args.provider)
  const sgRouter = createWeb3Contract<IStargateRouter>(IStargateRouterArtifact.abi, sgRouterAddress, args.provider)
  const quoteResult = await sgRouter.methods
    .quoteLayerZeroFee(args.dstChainId, 1, args.dstAddress, args.payload, [args.dstGasForCall, args.dstNativeAmount ?? 0, args.dstAddress])
    .call()
  const stargateFee = quoteResult['0']
  log.debug(`stargate fee=${stargateFee.toString()}`)
  return stargateFee
}
