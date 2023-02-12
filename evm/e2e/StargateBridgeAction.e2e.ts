import test from 'ava'
import fs from 'fs'
const truffleConfig = eval(fs.readFileSync('./truffle-config.js').toString())
import BN from 'bn.js'
import Web3 from 'web3'
import { EIP1193Provider } from 'eip1193-provider'
import { promisify } from 'util'
import HDWalletProvider from '@truffle/hdwallet-provider'
const truffleContract = require('@truffle/contract')
import { getNetworkConfig } from '../utils/contract-addresses'
import {
  getStargateRequiredNative,
  getStargateMinAmountOut,
  getStargateRouterAddress,
  StargateChainIds,
  StargatePoolIds,
} from '../utils/stargate-utils'

import {
  AaveSupplyActionInstance,
  FrontDoorInstance,
  IERC20Instance,
  IStargateRouterInstance,
  StargateBridgeActionInstance,
  WorkflowRunnerInstance,
} from '../types/truffle-contracts'

import FrontDoorArtifact from '../build/contracts/FrontDoor.json'
import WorkflowRunnerArtifact from '../build/contracts/WorkflowRunner.json'
import StargateBridgeActionArtifact from '../build/contracts/StargateBridgeAction.json'
import IERC20Artifact from '../build/contracts/IERC20.json'
import IStargateRouterArtifact from '../build/contracts/IStargateRouter.json'
import MockAavePoolArtifact from '../build/contracts/MockAavePool.json'
import AaveSupplyActionArtifact from '../build/contracts/AaveSupplyAction.json'

import { ActionIds } from '../utils/actionIds'
import { AddAssetActionArgs, encodeAddAssetArgs } from '../tslib/AddAssetAction'
import { AssetType } from '../tslib/AssetType'
import { encodeStargateBridgeArgs, getStargateBridgeActionAddress, waitForNonce, waitForNonceOld } from '../tslib/StargateBridgeAction'
import { EvmWorkflow } from '../tslib/EvmWorkflow'
import { getBridgePayload } from '../tslib/encode-workflow'
import { Asset } from '../tslib/Asset'
import { IStargateRouter } from '../types/ethers-contracts'
import { encodeAaveSupplyArgs } from '../tslib/AaveSupplyAction'

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

const FrontDoorSrc = truffleContract(FrontDoorArtifact)
const FrontDoorDst = truffleContract(FrontDoorArtifact)

const WorkflowRunnerSrc = truffleContract(WorkflowRunnerArtifact)
const WorkflowRunnerDst = truffleContract(WorkflowRunnerArtifact)

const DstStargateBridgeAction = truffleContract(StargateBridgeActionArtifact)

const DstAaveSupplyAction = truffleContract(AaveSupplyActionArtifact)
const DstMockAavePool = truffleContract(MockAavePoolArtifact)

const IStargateRouter = truffleContract(IStargateRouterArtifact)

const IERC20Src = truffleContract(IERC20Artifact)
const IERC20Dst = truffleContract(IERC20Artifact)

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

FrontDoorSrc.setProvider(srcProvider)
FrontDoorDst.setProvider(dstProvider)
WorkflowRunnerSrc.setProvider(srcProvider)
WorkflowRunnerDst.setProvider(dstProvider)
DstStargateBridgeAction.setProvider(dstProvider)
IERC20Src.setProvider(srcProvider)
IERC20Dst.setProvider(dstProvider)
IStargateRouter.setProvider(srcProvider)
DstMockAavePool.setProvider(dstProvider)
DstAaveSupplyAction.setProvider(dstProvider)
interface WorkflowCostItem {
  description: string
  amount: string
  asset: Asset
}

test('does a stargate swap in a workflow', async (t) => {
  const inputAmount = new BN(1_000_000) // $1.00

  const srcWeb3 = new Web3(srcProvider as any)
  const dstWeb3 = new Web3(dstProvider as any)

  const srcUserAddress = (srcProvider as unknown as HDWalletProvider).getAddress(0)
  const dstUserAddress = (dstProvider as unknown as HDWalletProvider).getAddress(0)

  console.log('initializing...')
  const srcFrontDoor = (await FrontDoorSrc.deployed()) as FrontDoorInstance
  const dstFrontDoor = (await FrontDoorDst.deployed()) as FrontDoorInstance
  const srcRunner = (await WorkflowRunnerSrc.at(srcFrontDoor.address)) as WorkflowRunnerInstance
  const dstRunner = (await WorkflowRunnerDst.at(dstFrontDoor.address)) as WorkflowRunnerInstance

  const dstAaveSupplyActionAddr = await dstRunner.getActionAddress(ActionIds.aaveSupply)
  const dstAaveSupplyAction = (await DstAaveSupplyAction.at(dstAaveSupplyActionAddr)) as AaveSupplyActionInstance
  const dstMockATokenAddr = await dstAaveSupplyAction.aTokenAddress()
  const dstMockAToken = (await IERC20Dst.at(dstMockATokenAddr)) as IERC20Instance
  const aTokenBalanceBefore = await dstMockAToken.balanceOf(dstUserAddress)

  // console.log(`srcUserAddress=${userAddressSrc} input amount=${inputAmount.toString()} minAmountOut=${minAmountOut.toString()} fee=${fee}`)

  const srcContractAddresses = getNetworkConfig(srcNetworkId)
  const dstContractAddresses = getNetworkConfig(dstNetworkId)
  const srcUsdc = (await IERC20Src.at(srcContractAddresses.sgUSDC)) as IERC20Instance
  const dstUsdc = (await IERC20Dst.at(dstContractAddresses.sgUSDC)) as IERC20Instance

  const srcUsdcAsset = {
    assetType: AssetType.ERC20,
    assetAddress: srcContractAddresses.sgUSDC,
  }

  // let the caller supply the dest chain's SG action so chains don't need to know about all other chains
  // TODO move into helper
  const dstStargateActionAddr = await getStargateBridgeActionAddress(dstProvider)
  const dstStargateAction = (await DstStargateBridgeAction.at(dstStargateActionAddr)) as StargateBridgeActionInstance
  const dstStargateRouterAddr = await dstStargateAction.stargateRouterAddress()

  const dstWorkflow: EvmWorkflow = {
    steps: [
      {
        //
        // -- Aave Supply
        actionId: ActionIds.aaveSupply,
        actionAddress: ADDRESS_ZERO,
        inputAssets: [
          {
            asset: {
              assetType: AssetType.ERC20,
              assetAddress: dstContractAddresses.sgUSDC,
            },
            amount: 100_000,
            amountIsPercent: true,
          },
        ],
        outputAssets: [],
        data: encodeAaveSupplyArgs({ onBehalfOf: dstUserAddress }),
        nextStepIndex: -1,
      },
    ],
  }
  const { encodedWorkflow: dstEncodedWorkflow, nonce } = getBridgePayload(dstUserAddress, dstWorkflow)
  // const dstGasEstimate = await dstStargateAction.sgReceive.estimateGas(
  //   1, // the remote chainId sending the tokens (value not used by us)
  //   ADDRESS_ZERO, // the remote Bridge address (value not used by us)
  //   2, // nonce (value not used by us)
  //   dstContractAddresses.sgUSDC, // the token contract on the dst chain
  //   inputAmount, // the qty of local _token contract tokens
  //   dstEncodedWorkflow,
  //   { from: dstStargateRouterAddr } // claim we are sg router as required by our sgReceive implementation
  // )
  const dstGasEstimate = 1_000_000

  // TODO this needs to be on chain because 'inputAmount' is not known in general
  const minAmountOut = await getStargateMinAmountOut({
    provider: srcProvider,
    frontDoorAddress: srcFrontDoor.address,
    inputAmount: inputAmount,
    dstChainId: StargateChainIds.GoerliArbitrum,
    srcPoolId: StargatePoolIds.USDC,
    dstPoolId: StargatePoolIds.USDC,
    dstUserAddress: dstUserAddress,
  })

  const srcGasCostStr = await srcWeb3.eth.getGasPrice()
  const dstGasCostStr = await dstWeb3.eth.getGasPrice()
  const srcGasCost = new BN(srcGasCostStr)
  const dstGasCost = new BN(dstGasCostStr)

  // console.log(`srcGasCost ${srcGasCostStr}`)
  // console.log(`dstGasCost ${dstGasCostStr}`)
  // const dstWorkflowGasCostEstimate = new BN(dstGasEstimate).mul(dstGasCost)

  const stargateRequiredNative = await getStargateRequiredNative({
    provider: srcProvider,
    frontDoorAddress: srcFrontDoor.address,
    dstAddress: dstUserAddress,
    dstGasForCall: dstGasEstimate.toString(),
    payload: dstEncodedWorkflow,
    dstChainId: StargateChainIds.GoerliArbitrum,
  })

  const srcUsdcBalance = await srcUsdc.balanceOf(srcUserAddress)
  const dstUsdcBalance = await dstUsdc.balanceOf(srcUserAddress)
  console.log(`before srcUsdcBalance=${srcUsdcBalance.toString()} dstUsdcBalance=${dstUsdcBalance}`)
  console.log('approving input asset transfer...')
  await srcUsdc.approve(srcRunner.address, inputAmount, { from: srcUserAddress })
  console.log('input asset transfer approved')

  const allowance = await srcUsdc.allowance(srcUserAddress, srcRunner.address)
  console.log(`allowance after approve: ${allowance}`)

  const approvalGasEstimate = await srcUsdc.approve.estimateGas(srcRunner.address, inputAmount, { from: srcUserAddress })
  console.log('asdf')

  // const stargateFeePlusGas = dstWorkflowGasCostEstimate.add(new BN(stargateBridgeFee)) // .mul(new BN('11')).div(new BN('10'))
  const ASSET_NATIVE: Asset = {
    assetType: AssetType.Native,
    assetAddress: ADDRESS_ZERO,
  }

  const srcWorkflow: EvmWorkflow = {
    steps: [
      //
      // -- Add Asset (USDC)
      {
        actionId: ActionIds.addAsset,
        actionAddress: ADDRESS_ZERO,
        inputAssets: [], // no input assets
        outputAssets: [srcUsdcAsset],
        data: encodeAddAssetArgs({
          fromAddress: srcUserAddress,
          amount: inputAmount,
        }),
        nextStepIndex: 1,
      },
      //
      // -- Stargate Bridge
      {
        actionId: ActionIds.stargateBridge,
        actionAddress: ADDRESS_ZERO,
        inputAssets: [
          {
            asset: srcUsdcAsset,
            amount: '1000000',
            amountIsPercent: true,
          },
          {
            asset: ASSET_NATIVE,
            amount: stargateRequiredNative.toString(),
            amountIsPercent: false,
          },
        ],
        outputAssets: [], // no output assets, the input asset is transfered from the caller
        data: encodeStargateBridgeArgs({
          dstActionAddress: dstStargateActionAddr, // who initially gets the money and gets invoked by SG
          dstUserAddress: dstStargateActionAddr, // dstUserAddress, // who gets the money after the continuation workflow completes
          srcPoolId: StargatePoolIds.USDC.toString(),
          dstPoolId: StargatePoolIds.USDC.toString(),
          dstChainId: StargateChainIds.GoerliArbitrum.toString(),
          dstGasForCall: dstGasEstimate.toString(), // gas units (not wei or gwei)
          dstNativeAmount: '0',
          minAmountOut: minAmountOut,
          minAmountOutIsPercent: false,
          dstWorkflow: dstEncodedWorkflow,
        }),
        nextStepIndex: -1,
      },
    ],
  }

  const srcWorkflowGasEstimate = await srcRunner.executeWorkflow.estimateGas(srcWorkflow, {
    from: srcUserAddress,
    value: stargateRequiredNative,
  })
  const srcWorkflowGasCost = srcGasCost.mul(new BN(srcWorkflowGasEstimate))
  const approvalGasCost = new BN(approvalGasEstimate).mul(srcGasCost)
  const maxSlippageAbsolute = inputAmount.sub(new BN(minAmountOut))

  const costs: WorkflowCostItem[] = [
    {
      description: 'token transfer approval gas',
      amount: approvalGasCost.toString(),
      asset: ASSET_NATIVE,
    },
    {
      description: 'source chain gas',
      amount: srcWorkflowGasCost.toString(),
      asset: ASSET_NATIVE,
    },
    {
      description: 'destination chain gas',
      amount: dstGasEstimate.toString(),
      asset: ASSET_NATIVE,
    },
    {
      description: 'Staragate fee',
      amount: dstGasCost.toString(),
      asset: ASSET_NATIVE,
    },
    {
      description: 'Staragate slippage (max)',
      amount: maxSlippageAbsolute.toString(),
      asset: srcUsdcAsset,
    },
  ]

  const displayableCosts = costs.map((it) => {
    const rv: any = { ...it }
    if (it.asset.assetType === AssetType.ERC20) {
      rv.asset = `erc20 (${it.asset.assetAddress})`
    } else {
      rv.asset = 'native'
    }
    return rv
  })
  console.table(displayableCosts)

  const dstStargateActionBalance = await dstUsdc.balanceOf(dstStargateActionAddr)

  console.log('submitting source chain workflow...')
  const txResponse = await srcRunner.executeWorkflow(srcWorkflow, { from: srcUserAddress, value: stargateRequiredNative })
  // console.log(JSON.stringify(txResponse, null, 4))
  console.log(`tx=${txResponse.tx}`)
  console.log('source chain workflow completed, waiting for continuation workflow...')
  const startMillis = Date.now()
  const dstStargateActionBalanceAfter = await dstUsdc.balanceOf(dstStargateActionAddr)
  // prettier-ignore
  // console.log(`before=${dstStargateActionBalance.toString()} after=${dstStargateActionBalanceAfter.toString()} diff=${dstStargateActionBalanceAfter.sub(dstStargateActionBalance).toString()}`)

  // const sgRouterAddr = await getStargateRouterAddress(srcFrontDoor.address, srcProvider)
  // const sgRouter = (await IStargateRouter.at(sgRouterAddr)) as IStargateRouterInstance

  // await srcUsdc.approve(sgRouterAddr, inputAmount, { from: srcUserAddress })
  // console.log('invoking stargate')
  // const sgResult = await sgRouter.swap(
  //   StargateChainIds.GoerliArbitrum, // dest chain
  //   StargatePoolIds.USDC, // src pool
  //   StargatePoolIds.USDC, // dst pool
  //   dstUserAddress, // refund address
  //   inputAmount, // amount $1 USDC
  //   minAmountOut,
  //   {
  //     dstGasForCall: dstGasEstimate.toString(), //dstGasEstimate.toString(),
  //     dstNativeAmount: 0,
  //     dstNativeAddr: srcUserAddress,
  //   },
  //   dstStargateActionAddr,
  //   // '0x',
  //   dstEncodedWorkflow,
  //   { from: srcUserAddress, value: stargateBridgeFee }
  // )
  // console.log('stargate invoked', sgResult)

  const dstProviderUrl = process.env['ARBITRUM_GOERLI_WS_URL']!
  await waitForNonceOld(dstProviderUrl, dstStargateActionAddr, dstContractAddresses.sgUSDC, nonce, 60_000 * 30)
  // await waitForNonce(
  //   dstProviderUrl,
  //   dstFrontDoor.address,
  //   nonce,
  //   60_000 * 5,
  //   dstContractAddresses.sgUSDC,
  //   dstMockATokenAddr,
  //   dstUserAddress,
  //   dstStargateActionAddr
  // )
  const endMillis = Date.now()
  const seconds = Math.round((endMillis - startMillis) / 1000)
  console.log(console.log(`continuation workflow completed in ${seconds} seconds`))

  const aTokenBalanceAfter = await dstMockAToken.balanceOf(dstUserAddress)
  console.log(`starting aTokens: ${aTokenBalanceBefore.toString()}`)
  console.log(`ending aTokens:   ${aTokenBalanceAfter.toString()}`)
  console.log(`difference:       ${aTokenBalanceAfter.sub(aTokenBalanceBefore).toString()}`)

  // const srcUsdcBalanceAfter = await srcUsdc.balanceOf(userAddressSrc)
  // t.is(srcUsdcBalance.sub(inputAmount).toString(), srcUsdcBalanceAfter.toString(), 'source balance delta')

  // const timeLimitMs = 60_000 * 5 // 5 mins
  // const timeOut = Date.now() + timeLimitMs
  // const expectedDstUsdcBalanceAfter = dstUsdcBalance.add(new BN(minAmountOut))
  // for (;;) {
  //   const dstUsdcBalanceAfter = await dstUsdc.balanceOf(userAddressSrc)
  //   if (dstUsdcBalanceAfter.gte(expectedDstUsdcBalanceAfter)) {
  //     console.log(`after  srcUsdcBalance=${srcUsdcBalanceAfter.toString()} dstUsdcBalance=${dstUsdcBalanceAfter}`)
  //     break
  //   }
  //   if (Date.now() >= timeOut) {
  //     t.fail('timeout waiting for dest balance to update')
  //   }
  //   console.log(`expected balance not found, time remaining: ${(timeOut - Date.now()) / 1000}`)
  //   await sleep(5000)
  // }

  // console.log(`sg result\n${JSON.stringify(sgResult)}`)

  await Promise.all([
    (srcProvider as unknown as HDWalletProvider).engine.stop(),
    (dstProvider as unknown as HDWalletProvider).engine.stop(),
  ])
  t.pass()
})
