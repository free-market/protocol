import rootLogger from 'loglevel'
import '../utils/init-logger'
import test from 'ava'
import fs from 'fs'
const truffleConfig = eval(fs.readFileSync('./truffle-config.js').toString())
import { ADDRESS_ZERO, getNetworkConfig } from '../tslib/contract-addresses'
import { getStargateRequiredNative, getStargateMinAmountOut, StargateChainIds, StargatePoolIds } from '../tslib/StargateBridgeAction'
import { Eip1193Bridge } from '@ethersproject/experimental'
import { getContractAddressViaNetworkId, getWalletFromMnemonic } from '../utils/ethers-utils'

import { ActionIds } from '../tslib/actionIds'
import { encodeAddAssetArgs } from '../tslib/AddAssetAction'
import { AssetType } from '../tslib/AssetType'
import { encodeStargateBridgeArgs, getStargateBridgeActionAddress } from '../tslib/StargateBridgeAction'
import { EvmWorkflow } from '../tslib/EvmWorkflow'
import { getBridgePayload } from '../tslib/encode-workflow'
import { Asset } from '../tslib/Asset'
import { FrontDoor__factory, IERC20__factory, WorkflowRunner__factory } from '../types/ethers-contracts'
import { getATokenAddress } from '../tslib/AaveSupplyAction'
import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers'
import { waitForContinuationNonce } from '../tslib/bridge-utils'
import { BigNumber } from '@ethersproject/bignumber'
import { VoidSigner } from 'ethers'

rootLogger.setLevel('debug')
const log = rootLogger.getLogger('e2e')

// const SRC_CHAIN = 'ethereumGoerli'
// const DST_CHAIN = 'arbitrumGoerli'
// const SRC_PROVICER_URL_ENVVAR = 'ETHEREUM_GOERLI_URL'
// const DST_PROVICER_URL_ENVVAR = 'ARBITRUM_GOERLI_WS_URL'
// const DST_CHAIN_ID= StargateChainIds.GoerliArbitrum,
// const SRC_CHAIN = 'optimism'
const SRC_CHAIN = 'avalanche'
const DST_CHAIN = 'arbitrum'
// const SRC_PROVICER_URL_ENVVAR = 'OPTIMISM_MAINNET_URL'
const SRC_PROVICER_URL_ENVVAR = 'AVALANCHE_MAINNET_URL'
const DST_PROVICER_URL_ENVVAR = 'ARBITRUM_MAINNET_WS_URL'
const DST_STARGATE_CHAIN_ID = StargateChainIds.Arbitrum

interface WorkflowCostItem {
  description: string
  amount: string
  asset: Asset
}

test('does a stargate swap in a workflow', async (t) => {
  log.debug('initializing...')
  const inputAmount = BigNumber.from(1_000_000) // $1.00

  const srcNetworkId = truffleConfig.networks[SRC_CHAIN].network_id
  const dstNetworkId = truffleConfig.networks[DST_CHAIN].network_id

  const srcFrontDoorAddr = getContractAddressViaNetworkId(srcNetworkId, 'FrontDoor')
  const dstFrontDoorAddr = getContractAddressViaNetworkId(dstNetworkId, 'FrontDoor')

  const srcNetworkConfig = getNetworkConfig(srcNetworkId)
  const dstNetworkConfig = getNetworkConfig(dstNetworkId)

  const srcProvider = new JsonRpcProvider(process.env[SRC_PROVICER_URL_ENVVAR])
  const dstProvider = new WebSocketProvider(process.env[DST_PROVICER_URL_ENVVAR]!)

  const srcWallet = getWalletFromMnemonic(process.env['WALLET_MNEMONIC']!, 0, srcProvider)
  const dstWallet = getWalletFromMnemonic(process.env['WALLET_MNEMONIC']!, 0, dstProvider)

  const voidSigner = new VoidSigner(ADDRESS_ZERO)
  const srcStandardProvider = new Eip1193Bridge(voidSigner, srcProvider)
  const dstStandardProvider = new Eip1193Bridge(voidSigner, dstProvider)

  const srcUserAddress = srcWallet.address
  const dstUserAddress = dstWallet.address

  const srcRunner = WorkflowRunner__factory.connect(srcFrontDoorAddr, srcWallet)
  const dstRunner = WorkflowRunner__factory.connect(dstFrontDoorAddr, dstWallet)

  const dstATokenAddr = await getATokenAddress(dstFrontDoorAddr, dstNetworkConfig.USDC, dstStandardProvider)

  const dstAToken = IERC20__factory.connect(dstATokenAddr, dstProvider)
  const aTokenBalanceBefore = await dstAToken.balanceOf(dstUserAddress)

  const srcUsdc = IERC20__factory.connect(srcNetworkConfig.USDC, srcWallet)
  const dstUsdc = IERC20__factory.connect(dstNetworkConfig.USDC, dstProvider)

  const srcUsdcAsset = {
    assetType: AssetType.ERC20,
    assetAddress: srcNetworkConfig.USDC, // srcContractAddresses.sgUSDC,
  }

  // TODO move to helper
  // let the caller supply the dest chain's SG action so chains don't need to know about all other chains
  const dstStargateActionAddr = await getStargateBridgeActionAddress(dstFrontDoorAddr, dstStandardProvider)

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
              assetAddress: dstNetworkConfig.USDC,
            },
            amount: '1000000',
            amountIsPercent: true,
          },
        ],
        outputAssets: [],
        data: '0x',
        nextStepIndex: -1,
      },
    ],
  }
  const { encodedWorkflow: dstEncodedWorkflow, nonce } = getBridgePayload(dstUserAddress, dstWorkflow)

  // TODO find a better way to estimate gas, hard coding for now
  const dstGasEstimate = 1_000_000

  // TODO this also needs to be implemented on chain because 'inputAmount' to stargate may not be known
  const minAmountOut = await getStargateMinAmountOut({
    provider: srcStandardProvider,
    frontDoorAddress: srcFrontDoorAddr,
    inputAmount: inputAmount.toString(),
    dstChainId: DST_STARGATE_CHAIN_ID,
    srcPoolId: StargatePoolIds.USDC,
    dstPoolId: StargatePoolIds.USDC,
    dstUserAddress: dstUserAddress,
  })

  const srcGasCost = await srcProvider.getGasPrice()
  const dstGasCost = await srcProvider.getGasPrice()

  const stargateRequiredNative = await getStargateRequiredNative({
    provider: srcStandardProvider,
    frontDoorAddress: srcFrontDoorAddr,
    dstAddress: dstUserAddress,
    dstGasForCall: dstGasEstimate.toString(),
    payload: dstEncodedWorkflow,
    dstChainId: DST_STARGATE_CHAIN_ID,
  })

  const srcUsdcBalance = await srcUsdc.balanceOf(srcUserAddress)
  const dstUsdcBalance = await dstUsdc.balanceOf(srcUserAddress)
  log.debug(`before srcUsdcBalance=${srcUsdcBalance.toString()} dstUsdcBalance=${dstUsdcBalance}`)
  let allowance = await srcUsdc.allowance(srcUserAddress, srcRunner.address)
  if (allowance.lt(inputAmount)) {
    log.debug(`approving input asset transfer: inputAmount=${inputAmount.toString()} allowance=${allowance.toString()}`)
    const txResponse = await srcUsdc.approve(srcRunner.address, inputAmount, { from: srcUserAddress })
    const txReceipt = await txResponse.wait(1)
    log.debug(`input asset transfer approved tx=${txReceipt.transactionHash}`)
  } else {
    log.debug(`current allowance sufficient: inputAmount=${inputAmount.toString()} allowance=${allowance.toString()}`)
  }

  allowance = await srcUsdc.allowance(srcUserAddress, srcRunner.address)
  log.debug(`allowance after approve: ${allowance}`)

  const approvalGasEstimate = await srcUsdc.estimateGas.approve(srcRunner.address, inputAmount, { from: srcUserAddress })

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
          amount: inputAmount.toString(),
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
          dstChainId: DST_STARGATE_CHAIN_ID.toString(),
          dstGasForCall: dstGasEstimate.toString(), // gas units (not wei or gwei)
          dstNativeAmount: '0',
          minAmountOut: minAmountOut,
          minAmountOutIsPercent: false,
          continuationWorkflow: dstEncodedWorkflow,
        }),
        nextStepIndex: -1,
      },
    ],
  }

  const srcWorkflowGasEstimate = await srcRunner.estimateGas.executeWorkflow(srcWorkflow, {
    value: stargateRequiredNative,
  })
  const srcWorkflowGasCost = srcGasCost.mul(srcWorkflowGasEstimate)
  const approvalGasCost = BigNumber.from(approvalGasEstimate).mul(srcGasCost)
  const maxSlippageAbsolute = inputAmount.sub(BigNumber.from(minAmountOut))

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

  log.debug('submitting source chain workflow...')
  const explicitGasLimit = srcWorkflowGasEstimate.mul(11).div(10)
  const txResponse = await srcRunner.executeWorkflow(srcWorkflow, {
    value: stargateRequiredNative,
    gasLimit: explicitGasLimit,
  })
  const txReceipt = await txResponse.wait(1)
  log.debug('source chain workflow completed, waiting for continuation workflow...')
  log.debug(`tx=${txReceipt.transactionHash}`)
  const startMillis = Date.now()

  const destTx = await waitForContinuationNonce({
    provider: dstStandardProvider,
    frontDoorAddress: dstFrontDoorAddr,
    nonce,
    timeoutMillis: 60_000 * 3,
    loggingArgs: {
      dstBridgeTokenAddr: dstNetworkConfig.USDC,
      aTokenAddr: dstATokenAddr,
      userAddr: dstUserAddress,
    },
  })
  const endMillis = Date.now()
  const seconds = Math.round((endMillis - startMillis) / 1000)
  log.debug(log.debug(`continuation workflow completed in ${seconds} seconds`))

  const aTokenBalanceAfter = await dstAToken.balanceOf(dstUserAddress)
  const aTokenDifference = aTokenBalanceAfter.sub(aTokenBalanceBefore)
  log.debug(`starting aTokens: ${aTokenBalanceBefore.toString()}`)
  log.debug(`ending aTokens:   ${aTokenBalanceAfter.toString()}`)
  log.debug(`difference:       ${aTokenDifference.toString()}`)

  t.assert(aTokenDifference.gt(0))

  await dstProvider.destroy()
  t.pass()
})
