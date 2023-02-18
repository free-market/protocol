import { Web3Provider, WebSocketProvider } from '@ethersproject/providers'
import BN from 'bn.js'
import { EIP1193Provider } from 'eip1193-provider'
import { BigNumber } from 'ethers'
import log from 'loglevel'
import Web3 from 'web3'
import { default as frontDoorArtifact, default as FrontDoorArtifact } from '../build/contracts/FrontDoor.json'
import IStargateFactoryArtifact from '../build/contracts/IStargateFactory.json'
import IStargateFeeLibraryArtifact from '../build/contracts/IStargateFeeLibrary.json'
import IStargatePoolArtifact from '../build/contracts/IStargatePool.json'
import IStargateRouterArtifact from '../build/contracts/IStargateRouter.json'
import StargateBridgeActionArtifact from '../build/contracts/StargateBridgeAction.json'
import { default as workflowRunnerArtifact, default as WorkflowRunnerArtifact } from '../build/contracts/WorkflowRunner.json'
import { IERC20__factory, StargateBridgeAction__factory, WorkflowRunner__factory } from '../types/ethers-contracts'
import { BridgePayloadStructOutput, WorkflowStepStructOutput } from '../types/ethers-contracts/StargateBridgeAction'
import { FrontDoorInstance } from '../types/truffle-contracts/FrontDoor'
import { WorkflowRunnerInstance } from '../types/truffle-contracts/WorkflowRunner'
import { FrontDoor } from '../types/web3-v1-contracts/FrontDoor'
import { IStargateFactory } from '../types/web3-v1-contracts/IStargateFactory'
import { IStargateFeeLibrary } from '../types/web3-v1-contracts/IStargateFeeLibrary'
import { IStargatePool } from '../types/web3-v1-contracts/IStargatePool'
import { IStargateRouter } from '../types/web3-v1-contracts/IStargateRouter'
import { StargateBridgeAction } from '../types/web3-v1-contracts/StargateBridgeAction'
import { WorkflowRunner } from '../types/web3-v1-contracts/WorkflowRunner'
import { ActionIds } from './actionIds'
import { concatHex, hexByteLength } from './hexStringUtils'
const truffleContract = require('@truffle/contract')
const FrontDoor = truffleContract(frontDoorArtifact)
const WorkflowRunner = truffleContract(workflowRunnerArtifact)
const Contract = require('web3-eth-contract')

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

// untested ethers impl
// export async function getStargateBridgeActionAddress(frontDoorAddress: string, provider: EIP1193Provider): Promise<string> {
//   const ethersProvider = new Web3Provider(provider)
//   const runner = WorkflowRunner__factory.connect(frontDoorAddress, ethersProvider)
//   const sgBridgeAddress = await runner.getActionAddress(ActionIds.stargateBridge)
//   return sgBridgeAddress
// }

export async function getStargateBridgeActionAddress(provider: EIP1193Provider): Promise<string> {
  FrontDoor.setProvider(provider)
  WorkflowRunner.setProvider(provider)
  const frontDoor = (await FrontDoor.deployed()) as FrontDoorInstance
  const runner = (await WorkflowRunner.at(frontDoor.address)) as WorkflowRunnerInstance
  const stargateBridgeActionAddress = await runner.getActionAddress(ActionIds.stargateBridge)
  return stargateBridgeActionAddress
}

// TODO this will change to the generic bridge continuation event
export function waitForNonceOld(
  webSocketProviderUrl: string,
  stargateBridgeActionAddress: string,
  assetAddress: string,
  nonce: string,
  timeoutMillis: number
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    console.log('sgba', stargateBridgeActionAddress)
    const provider = new WebSocketProvider(webSocketProviderUrl)
    const sba = StargateBridgeAction__factory.connect(stargateBridgeActionAddress, provider)
    const expectedNonce = BigNumber.from(nonce)
    const asset = IERC20__factory.connect(assetAddress, provider)

    let x = 0
    const updaterInterval = setInterval(async () => {
      x += 10
      log.debug('elapsed: ' + x)
      const bal = await asset.balanceOf(stargateBridgeActionAddress)
      console.log(`elapsed seconds: ${x}  ${bal.toString()}`)
    }, 10_000)

    const timeout = setTimeout(() => {
      sba.removeAllListeners() // canceles the subscription
      clearInterval(updaterInterval)
      reject()
    }, timeoutMillis)
    // const filter = sba.filters.SgReceiveCalled(null)
    // const asdf = sba.on(filter, (bridgePayload, _event) => {
    //   if (bridgePayload.nonce.eq(expectedNonce)) {
    //     sba.removeAllListeners()
    //     clearTimeout(timeout)
    //     clearInterval(updaterInterval)
    //     resolve()
    //   }
    // })
    const filter = sba.filters.SgReceiveCalled(null)
    const asdf = sba.on(filter, (tokenAddr, amount, x: BridgePayloadStructOutput, _event) => {
      const steps: WorkflowStepStructOutput[] = x.workflow.steps

      console.log('omg workflow', tokenAddr, amount, JSON.stringify(steps.length))
      for (const step of steps) {
        console.log(`step:  
  actionId=${step.actionId}
  actionAddress=${step.actionAddress}
  inputAssets=${JSON.stringify(step.inputAssets)}
  inputAssets=${JSON.stringify(step.outputAssets)}
  data=${step.data}
  nextStepIndex=${step.nextStepIndex}        
        `)
      }
      sba.removeAllListeners()
      clearTimeout(timeout)
      clearInterval(updaterInterval)
      resolve()
    })
  })
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

      console.log(`elapsed=${x} | action usdc=${actionUsdc} | user usdc=${userUsdc} | user aToken=${userAToken}`)
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
