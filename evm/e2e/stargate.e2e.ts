import fs from 'fs'
const truffleConfig = eval(fs.readFileSync('./truffle-config.js').toString())

import test from 'ava'
import HDWalletProvider from '@truffle/hdwallet-provider'
const truffleContract = require('@truffle/contract')
import { getNetworkConfig } from '../utils/contract-addresses'
import { ActionIds } from '../utils/actionIds'

import { FrontDoorInstance } from '../types/truffle-contracts/FrontDoor'
import { WorkflowRunnerInstance } from '../types/truffle-contracts/WorkflowRunner'
import { StargateBridgeActionInstance } from '../types/truffle-contracts/StargateBridgeAction'
import { IStargateRouterInstance } from '../types/truffle-contracts/IStargateRouter'
import { IStargateFactoryInstance } from '../types/truffle-contracts/IStargateFactory'
import { IStargatePoolInstance } from '../types/truffle-contracts/IStargatePool'
import { IStargateFeeLibraryInstance } from '../types/truffle-contracts/IStargateFeeLibrary'
import { IERC20Instance } from '../types/truffle-contracts/IERC20'

import frontDoorArtifact from '../build/contracts/FrontDoor.json'
import workflowRunnerArtifact from '../build/contracts/WorkflowRunner.json'
import stargateBridgeActionArtifact from '../build/contracts/StargateBridgeAction.json'
import stargateRouterArtifact from '../build/contracts/IStargateRouter.json'
import stargateFactoryArtifact from '../build/contracts/IStargateFactory.json'
import stargatePoolArtifact from '../build/contracts/IStargatePool.json'
import stargateFeeLibraryArtifact from '../build/contracts/IStargateFeeLibrary.json'
import erc20Artifact from '../build/contracts/IERC20.json'

import BN from 'bn.js'

function formatStep(step: any) {
  return `actionId: ${step.actionId}\nlatest:${step.latest}\nwhitelist: ${JSON.stringify(step.whitelist)}\nblacklist: ${JSON.stringify(
    step.blacklist
  )}`
}

const srcChain = 'ethereumGoerli'
const dstChain = 'arbitrumGoerli'
const srcProvider = truffleConfig.networks[srcChain].provider() as HDWalletProvider
const dstProvider = truffleConfig.networks[dstChain].provider() as HDWalletProvider
const srcNetworkId = truffleConfig.networks[srcChain].network_id
const dstNetworkId = truffleConfig.networks[dstChain].network_id

const FrontDoor = truffleContract(frontDoorArtifact)
const WorkflowRunner = truffleContract(workflowRunnerArtifact)
const StargateBridgeAction = truffleContract(stargateBridgeActionArtifact)
const IStargateRouter = truffleContract(stargateRouterArtifact)
const IStargateFactory = truffleContract(stargateFactoryArtifact)
const IStargatePool = truffleContract(stargatePoolArtifact)
const IStargateFeeLibrary = truffleContract(stargateFeeLibraryArtifact)
const IERC20 = truffleContract(erc20Artifact)

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

const StargateChainIds = {
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
}

const StargatePoolIds = {
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
}

const StargatePoolIdsByChain: Record<string, number[]> = {
  Ethereum: [1, 2, 3, 7, 11, 13, 14, 15, 16, 17, 19],
  BSC: [2, 5, 11, 16, 17, 19],
  Avalanche: [1, 2, 7, 16, 19],
  Polygon: [1, 2, 3, 16],
  Arbitrum: [1, 2, 7, 13, 15, 16],
  Optimism: [1, 3, 7, 13, 14, 15, 16],
  Fantom: [1],
  Metis: [17, 19],
}

FrontDoor.setProvider(srcProvider)
WorkflowRunner.setProvider(srcProvider)
StargateBridgeAction.setProvider(srcProvider)
IStargateRouter.setProvider(srcProvider)
IStargateFactory.setProvider(srcProvider)
IStargatePool.setProvider(srcProvider)
IStargateFeeLibrary.setProvider(srcProvider)
IERC20.setProvider(srcProvider)

type BNish = number | BN | string
async function getPool(router: IStargateRouterInstance, poolId: BNish) {
  const factoryAddr = await router.factory()
  const factory = (await IStargateFactory.at(factoryAddr)) as IStargateFactoryInstance
  const poolAddr = await factory.getPool(poolId)
  const pool = (await IStargatePool.at(poolAddr)) as IStargatePoolInstance
  return pool
}

async function getFeeLibrary(router: IStargateRouterInstance, poolId: BNish) {
  const pool = await getPool(router, poolId)

  const feeLibraryAddress = await pool.feeLibrary()
  const feeLibrary = (await IStargateFeeLibrary.at(feeLibraryAddress)) as IStargateFeeLibraryInstance
  return feeLibrary
}

// fudge factor:  multiply minAmoutOut by 999/1000 = 1 / 1000 = 0.1%
const fudgeFactorNumerator = new BN(999)
const fudgeFactorDenominator = new BN(1000)

async function getMinAmountOut(
  inputAmount: BN,
  router: IStargateRouterInstance,
  dstChainId: BNish,
  srcPoolId: BNish,
  dstPoolId: BNish,
  dstUserAddress: string
) {
  const feeLibrary = await getFeeLibrary(router, srcPoolId)
  const swapObj = await feeLibrary.getFees(srcPoolId, dstPoolId, dstChainId, dstUserAddress, 1_000_000)
  return inputAmount
    .sub(new BN(swapObj.eqFee))
    .sub(new BN(swapObj.protocolFee))
    .sub(new BN(swapObj.lpFee))
    .add(new BN(swapObj.eqReward))
    .mul(fudgeFactorNumerator)
    .div(fudgeFactorDenominator)
}

function getSlippageAsPercent(inputAmount: BN, minAmountOut: BN): number {
  const absoluteSlippage = inputAmount.sub(minAmountOut)
  const percentSlippage = absoluteSlippage.mul(new BN(100)).div(inputAmount)
  return 0
}

test('does a stargate swap in a workflow', async (t) => {
  const frontDoor = (await FrontDoor.deployed()) as FrontDoorInstance

  const upstream = await frontDoor.getUpstream()
  const workflowRunner = (await WorkflowRunner.deployed()) as WorkflowRunnerInstance
  t.is(workflowRunner.address, upstream)

  const fmp = (await WorkflowRunner.at(frontDoor.address)) as WorkflowRunnerInstance
  const actionCount = (await fmp.getActionCount()).toNumber()
  t.log(`${actionCount} actions are registered`)
  for (let i = 0; i < actionCount; ++i) {
    const ai = await fmp.getActionInfoAt(i)
    t.log(formatStep(ai))
  }
  const stargateBridgeActionAddress = await fmp.getActionAddress(ActionIds.stargateBridge)
  const stargateBridgeAction = (await StargateBridgeAction.deployed()) as StargateBridgeActionInstance
  t.is(stargateBridgeAction.address, stargateBridgeActionAddress)

  const srcContractAddresses = getNetworkConfig(srcNetworkId)

  const stargateRouterAddress = await stargateBridgeAction.stargateContractAddress()
  t.is(srcContractAddresses.stargateRouter, stargateRouterAddress)

  // await Promise.all([srcProvider.engine.stop(), dstProvider.engine.stop()])

  const stargateRouter = (await IStargateRouter.at(srcContractAddresses.stargateRouter)) as IStargateRouterInstance

  const dstUserAddress = '0x242b2eeCE36061FF84EC0Ea69d4902373858fB2F'
  const inputAmount = new BN(1_000_000)
  const minAmountOut = await getMinAmountOut(
    inputAmount,
    stargateRouter,
    StargateChainIds.GoerliArbitrum,
    StargatePoolIds.USDC,
    StargatePoolIds.USDC,
    frontDoor.address
  )
  t.log(`input amount=${inputAmount.toString()} minAmountOut=${minAmountOut.toString()}`)

  const stargateDstChainID = 10143 // 110 // StargateChainIds.Arbitrum

  const quoteResult = await stargateRouter.quoteLayerZeroFee(StargateChainIds.GoerliArbitrum, 1, dstUserAddress, '0x', {
    dstGasForCall: 0,
    dstNativeAmount: 0,
    dstNativeAddr: dstUserAddress,
  })
  const stargateFee = quoteResult['0']
  t.log(`SG fee ${stargateFee.toString()}`)

  console.log(`USDC address: ${srcContractAddresses.stargateUSDC}`)
  const usdc = (await IERC20.at(srcContractAddresses.stargateUSDC)) as IERC20Instance
  const usdcBalance = await usdc.balanceOf(dstUserAddress)
  console.log(`usdcBalance ${usdcBalance.toString()}`)

  const approveResult = await usdc.approve(srcContractAddresses.stargateRouter, inputAmount, { from: dstUserAddress })
  t.log(`usdc.approve result\n${JSON.stringify(approveResult)}`)

  const allowance = await usdc.allowance(dstUserAddress, srcContractAddresses.stargateRouter)
  t.log(`allowance ${allowance}`)

  const sgResult = await stargateRouter.swap(
    StargateChainIds.GoerliArbitrum, // dest chain
    StargatePoolIds.USDC, // src pool
    StargatePoolIds.USDC, // dst pool
    dstUserAddress, // refund address
    inputAmount, // amount $1 USDC
    '1',
    {
      dstGasForCall: 0,
      dstNativeAmount: 0,
      dstNativeAddr: ADDRESS_ZERO,
    },
    dstUserAddress,
    '0x',
    { from: dstUserAddress, value: stargateFee }
  )

  t.log(`sg result\n${JSON.stringify(sgResult)}`)

  t.pass()
})
