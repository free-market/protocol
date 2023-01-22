import fs from 'fs'
const truffleConfig = eval(fs.readFileSync('./truffle-config.js').toString())
import { promisify } from 'util'
import test from 'ava'
import HDWalletProvider from '@truffle/hdwallet-provider'
const truffleContract = require('@truffle/contract')
import { getNetworkConfig } from '../utils/contract-addresses'
import {
  getStargateFee,
  getStargateMinAmountOut,
  getStargateRouterAddress,
  StargateChainIds,
  StargatePoolIds,
} from '../utils/stargate-utils'
import { FrontDoorInstance } from '../types/truffle-contracts/FrontDoor'
import { WorkflowRunnerInstance } from '../types/truffle-contracts/WorkflowRunner'
import { IStargateRouterInstance } from '../types/truffle-contracts/IStargateRouter'
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
import { EIP1193Provider } from 'eip1193-provider'

function formatStep(step: any) {
  return `actionId: ${step.actionId}\nlatest:${step.latest}\nwhitelist: ${JSON.stringify(step.whitelist)}\nblacklist: ${JSON.stringify(
    step.blacklist
  )}`
}

const sleep = promisify(setTimeout)

const srcChain = 'ethereumGoerli'
const dstChain = 'arbitrumGoerli'
const srcProvider = truffleConfig.networks[srcChain].provider() as EIP1193Provider
const dstProvider = truffleConfig.networks[dstChain].provider() as EIP1193Provider
const srcNetworkId = truffleConfig.networks[srcChain].network_id
const dstNetworkId = truffleConfig.networks[dstChain].network_id

const FrontDoor = truffleContract(frontDoorArtifact)
const WorkflowRunner = truffleContract(workflowRunnerArtifact)
const StargateBridgeAction = truffleContract(stargateBridgeActionArtifact)
const IStargateRouter = truffleContract(stargateRouterArtifact)
const IStargateFactory = truffleContract(stargateFactoryArtifact)
const IStargatePool = truffleContract(stargatePoolArtifact)
const IStargateFeeLibrary = truffleContract(stargateFeeLibraryArtifact)
const IERC20Src = truffleContract(erc20Artifact)
const IERC20Dst = truffleContract(erc20Artifact)

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

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
IERC20Src.setProvider(srcProvider)
IERC20Dst.setProvider(dstProvider)

test('does a stargate swap in a workflow', async (t) => {
  const frontDoor = (await FrontDoor.deployed()) as FrontDoorInstance
  const fmp = (await WorkflowRunner.at(frontDoor.address)) as WorkflowRunnerInstance
  const inputAmount = new BN(1_000_000) // $1.00

  const userAddress = (srcProvider as unknown as HDWalletProvider).getAddress(0)
  const minAmountOut = await getStargateMinAmountOut({
    provider: srcProvider,
    frontDoorAddress: frontDoor.address,
    inputAmount: inputAmount,
    dstChainId: StargateChainIds.GoerliArbitrum,
    srcPoolId: StargatePoolIds.USDC,
    dstPoolId: StargatePoolIds.USDC,
    dstUserAddress: userAddress,
  })

  const fee = await getStargateFee({
    provider: srcProvider,
    frontDoorAddress: frontDoor.address,
    dstAddress: userAddress,
    dstGasForCall: '0',
    payload: '0x',
    dstChainId: StargateChainIds.GoerliArbitrum,
  })

  t.log(`userAddress=${userAddress} input amount=${inputAmount.toString()} minAmountOut=${minAmountOut.toString()} fee=${fee}`)

  const srcContractAddresses = getNetworkConfig(srcNetworkId)
  const srcUsdc = (await IERC20Src.at(srcContractAddresses.sgUSDC)) as IERC20Instance
  const srcUsdcBalance = await srcUsdc.balanceOf(userAddress)
  const dstContractAddresses = getNetworkConfig(dstNetworkId)
  const dstUsdc = (await IERC20Dst.at(dstContractAddresses.sgUSDC)) as IERC20Instance
  const dstUsdcBalance = await dstUsdc.balanceOf(userAddress)
  t.log(`before srcUsdcBalance=${srcUsdcBalance.toString()} dstUsdcBalance=${dstUsdcBalance}`)

  await srcUsdc.approve(srcContractAddresses.stargateRouter, inputAmount, { from: userAddress })

  const allowance = await srcUsdc.allowance(userAddress, srcContractAddresses.stargateRouter)
  t.log(`allowance after approve: ${allowance}`)

  const sgRouterAddr = await getStargateRouterAddress(frontDoor.address, srcProvider)
  const sgRouter = (await IStargateRouter.at(sgRouterAddr)) as IStargateRouterInstance

  const sgResult = await sgRouter.swap(
    StargateChainIds.GoerliArbitrum, // dest chain
    StargatePoolIds.USDC, // src pool
    StargatePoolIds.USDC, // dst pool
    userAddress, // refund address
    inputAmount, // amount $1 USDC
    '1',
    {
      dstGasForCall: 0,
      dstNativeAmount: 0,
      dstNativeAddr: userAddress,
    },
    userAddress,
    '0x',
    { from: userAddress, value: fee }
  )

  const srcUsdcBalanceAfter = await srcUsdc.balanceOf(userAddress)
  t.is(srcUsdcBalance.sub(inputAmount).toString(), srcUsdcBalanceAfter.toString(), 'source balance delta')

  const timeLimitMs = 60_000 * 5 // 5 mins
  const timeOut = Date.now() + timeLimitMs
  const expectedDstUsdcBalanceAfter = dstUsdcBalance.add(new BN(minAmountOut))
  for (;;) {
    const dstUsdcBalanceAfter = await dstUsdc.balanceOf(userAddress)
    if (dstUsdcBalanceAfter.gte(expectedDstUsdcBalanceAfter)) {
      t.log(`after  srcUsdcBalance=${srcUsdcBalanceAfter.toString()} dstUsdcBalance=${dstUsdcBalanceAfter}`)
      break
    }
    if (Date.now() >= timeOut) {
      t.fail('timeout waiting for dest balance to update')
    }
    console.log(`expected balance not found, time remaining: ${(timeOut - Date.now()) / 1000}`)
    await sleep(5000)
  }

  // t.log(`sg result\n${JSON.stringify(sgResult)}`)

  await Promise.all([
    (srcProvider as unknown as HDWalletProvider).engine.stop(),
    (dstProvider as unknown as HDWalletProvider).engine.stop(),
  ])
  t.pass()
})
