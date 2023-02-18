import { concatHex, hexByteLength } from '../e2e/hexStringUtils'
import { EIP1193Provider } from 'eip1193-provider'
import { BigNumber } from 'ethers'
import log from 'loglevel'
import Web3 from 'web3'
import { default as frontDoorArtifact, default as FrontDoorArtifact } from '../build/contracts/FrontDoor.json'
import { default as workflowRunnerArtifact, default as WorkflowRunnerArtifact } from '../build/contracts/WorkflowRunner.json'
import {
  IERC20__factory,
  StargateBridgeAction__factory,
  WorkflowRunner__factory,
  IStargatePool__factory,
  IStargateRouter__factory,
  IStargateFactory__factory,
  IStargateFeeLibrary__factory,
} from '../types/ethers-contracts'
import { ActionIds } from './actionIds'
import { Web3Provider, WebSocketProvider } from '@ethersproject/providers'

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

const sgFeeLibraryCache = new Map<string, string>()
const sgRouterCache = new Map<string, string>()

export async function getStargateRouterAddress(frontDoorAddress: string, provider: EIP1193Provider): Promise<string> {
  let sgRouterAddr = sgFeeLibraryCache.get(frontDoorAddress)
  if (!sgRouterAddr) {
    log.debug('StargateRouter address not cached, retreiving')
    const ethersProvider = new Web3Provider(provider)
    const runner = WorkflowRunner__factory.connect(frontDoorAddress, ethersProvider)
    const sgBridgeActionAddr = await runner.getActionAddress(ActionIds.stargateBridge)
    log.debug(`StargateBridgeAction address=${sgBridgeActionAddr}`)
    const sgBridgeAction = StargateBridgeAction__factory.connect(sgBridgeActionAddr, ethersProvider)
    sgRouterAddr = await sgBridgeAction.stargateRouterAddress()
    log.debug(`StargateRouter address=${sgRouterAddr}`)
    sgRouterCache.set(frontDoorAddress, sgRouterAddr)
  }
  return sgRouterAddr
}

async function getFeeLibraryAddress(frontDoorAddress: string, srcPoolId: number, provider: EIP1193Provider): Promise<string> {
  const key = frontDoorAddress + srcPoolId
  let sgFeeLibraryAddr = sgFeeLibraryCache.get(key)
  if (!sgFeeLibraryAddr) {
    log.debug('StargateFeeLibrary address not cached, retreiving')
    const ethersProvider = new Web3Provider(provider)
    const sgRouterAddress = await getStargateRouterAddress(frontDoorAddress, provider)
    const sgRouter = IStargateRouter__factory.connect(sgRouterAddress, ethersProvider)
    const sgFactoryAddr = await sgRouter.factory()
    log.debug(`StargateFactory address=${sgFactoryAddr}`)
    const sgFactory = IStargateFactory__factory.connect(sgFactoryAddr, ethersProvider)
    const sgPoolAddr = await sgFactory.getPool(srcPoolId)
    log.debug(`StargatePool address=${sgPoolAddr}`)
    const sgPool = IStargatePool__factory.connect(sgPoolAddr, ethersProvider)
    sgFeeLibraryAddr = await sgPool.feeLibrary()
    log.debug(`StargateFeeLibrary address=${sgFeeLibraryAddr}`)
    sgFeeLibraryCache.set(key, sgFeeLibraryAddr)
  }
  return sgFeeLibraryAddr
}

export interface StargateMinAmountOutArgs {
  provider: EIP1193Provider
  frontDoorAddress: string
  inputAmount: string
  dstChainId: number
  srcPoolId: number
  dstPoolId: number
  dstUserAddress: string
}

// fudge factor:  multiply minAmoutOut by 999/1000 = 1 / 1000 = 0.1%
const fudgeFactorNumerator = BigNumber.from(999)
const fudgeFactorDenominator = BigNumber.from(1000)

export async function getStargateMinAmountOut(args: StargateMinAmountOutArgs): Promise<string> {
  const sgFeeLibraryAddr = await getFeeLibraryAddress(args.frontDoorAddress, args.srcPoolId, args.provider)
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
    .mul(fudgeFactorNumerator)
    .div(fudgeFactorDenominator)

  log.debug(`stargate minAmountOut=${minAmountOut}`)
  return minAmountOut.toString()
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
export async function getStargateRequiredNative(args: StargateFeeArgs): Promise<string> {
  log.debug(`getting stargate required gas=${args.dstGasForCall} airdrop=${args.dstNativeAmount}`)
  const sgRouterAddress = await getStargateRouterAddress(args.frontDoorAddress, args.provider)
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
  dstWorkflow: string
}

export function encodeStargateBridgeArgs(args: StargateBridgeActionArgs) {
  const web3 = new Web3()
  const stargateSwapParams = web3.eth.abi.encodeParameters(
    ['address', 'address', 'uint16', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bool'],
    [
      args.dstActionAddress,
      args.dstUserAddress,
      args.dstChainId,
      args.srcPoolId,
      args.dstPoolId,
      args.dstGasForCall,
      args.dstNativeAmount,
      args.minAmountOut,
      args.minAmountOutIsPercent,
    ]
  )

  const lengthPrefix = web3.eth.abi.encodeParameters(['uint256'], [hexByteLength(stargateSwapParams)])
  return concatHex(lengthPrefix, concatHex(stargateSwapParams, args.dstWorkflow))
}

export async function getStargateBridgeActionAddress(frontDoorAddress: string, provider: EIP1193Provider): Promise<string> {
  const ethersProvider = new Web3Provider(provider)
  const runner = WorkflowRunner__factory.connect(frontDoorAddress, ethersProvider)
  const stargateBridgeActionAddress = await runner.getActionAddress(ActionIds.stargateBridge)
  return stargateBridgeActionAddress
}

export function waitForNonce(
  webSocketProviderUrl: string,
  frontDoorAddress: string,
  nonce: string,
  timeoutMillis: number,
  dstUsdcAddr: string,
  dstATokenAddr: string,
  dstUserAddr: string,
  dstActionAddr: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const provider = new WebSocketProvider(webSocketProviderUrl)
    const runner = WorkflowRunner__factory.connect(frontDoorAddress, provider)
    const expectedNonce = BigNumber.from(nonce)
    const filter = runner.filters.WorkflowContinuation(null, null, null)

    const dstUsdc = IERC20__factory.connect(dstUsdcAddr, provider)
    const dstAToken = IERC20__factory.connect(dstATokenAddr, provider)

    let x = 0
    const updaterInterval = setInterval(async () => {
      x += 10
      // log.debug('elapsed: ' + x)
      const [actionUsdc, userUsdc, userAToken] = await Promise.all([
        dstUsdc.balanceOf(dstActionAddr),
        dstUsdc.balanceOf(dstUserAddr),
        dstAToken.balanceOf(dstUserAddr),
      ])

      log.debug(`elapsed=${x} | action usdc=${actionUsdc} | user usdc=${userUsdc} | user aToken=${userAToken}`)
    }, 10_000)

    const timeout = setTimeout(() => {
      runner.removeAllListeners() // canceles the subscription
      clearInterval(updaterInterval)
      reject('timeout')
    }, timeoutMillis)
    runner.on(filter, (nonce, _userAddress, startingAsset, _event) => {
      if (nonce.eq(expectedNonce)) {
        runner.removeAllListeners()
        clearInterval(updaterInterval)
        clearTimeout(timeout)
        resolve(startingAsset.amount.toString())
      }
    })
  })
}

// const StargatePoolIdsByChain: Record<string, number[]> = {
//   Ethereum: [1, 2, 3, 7, 11, 13, 14, 15, 16, 17, 19],
//   BSC: [2, 5, 11, 16, 17, 19],
//   Avalanche: [1, 2, 7, 16, 19],
//   Polygon: [1, 2, 3, 16],
//   Arbitrum: [1, 2, 7, 13, 15, 16],
//   Optimism: [1, 3, 7, 13, 14, 15, 16],
//   Fantom: [1],
//   Metis: [17, 19],
// }
