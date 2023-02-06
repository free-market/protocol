// import test from 'ava'
// import fs from 'fs'
// const truffleConfig = eval(fs.readFileSync('./truffle-config.js').toString())
// import { promisify } from 'util'
// import HDWalletProvider from '@truffle/hdwallet-provider'
// const truffleContract = require('@truffle/contract')
// import { getNetworkConfig } from '../utils/contract-addresses'
// import {
//   getStargateRequiredNative,
//   getStargateMinAmountOut,
//   getStargateRouterAddress,
//   StargateChainIds,
//   StargatePoolIds,
// } from '../utils/stargate-utils'
// import { FrontDoorInstance } from '../types/truffle-contracts/FrontDoor'
// import { WorkflowRunnerInstance } from '../types/truffle-contracts/WorkflowRunner'
// import { IERC20Instance } from '../types/truffle-contracts/IERC20'

// import erc20Artifact from '../build/contracts/IERC20.json'
// import IAaveMintableERC20Artifact from '../build/contracts/IAaveMintableERC20.json'
// import BN from 'bn.js'
// import { EIP1193Provider } from 'eip1193-provider'
// import { ActionIds } from '../utils/actionIds'
// import { AddAssetActionArgs, encodeAddAssetArgs } from '../tslib/AddAssetAction'
// import { AssetType } from '../tslib/AssetType'
// import { encodeStargateBridgeArgs, getStargateBridgeActionAddress, waitForNonce } from '../tslib/StargateBridgeAction'
// import { EvmWorkflow } from '../tslib/Workflow'
// import { getBridgePayload } from '../tslib/encode-workflow'
// import { IAaveMintableERC20Instance, IStargateRouterInstance, StargateBridgeActionInstance } from '../types/truffle-contracts'
// import Web3 from 'web3'
// import { Asset } from '../tslib/Asset'
// import { IStargateRouter } from '../types/ethers-contracts'

// function formatStep(step: any) {
//   return `actionId: ${step.actionId}\nlatest:${step.latest}\nwhitelist: ${JSON.stringify(step.whitelist)}\nblacklist: ${JSON.stringify(
//     step.blacklist
//   )}`
// }

// const sleep = promisify(setTimeout)

// const chain = 'ethereumGoerli'
// const provider = truffleConfig.networks[chain].provider() as EIP1193Provider
// const networkId = truffleConfig.networks[chain].network_id
// const IERC20Dst = truffleContract(erc20Artifact)
// const IAaveMintableERC20 = truffleContract(IAaveMintableERC20Artifact)

// export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

// IERC20Dst.setProvider(provider)
// IAaveMintableERC20.setProvider(provider)

// test('does an Aave supply(...)', async (t) => {
//   const inputAmount = new BN(1_000_000) // $1.00

//   const web3 = new Web3(provider as any)

//   const userAddress = (provider as unknown as HDWalletProvider).getAddress(0)

//   const contractAddresses = getNetworkConfig(networkId)
//   const usdc = (await IAaveMintableERC20.at(contractAddresses.aaveUSDC)) as IAaveMintableERC20Instance
//   const startBalance = await usdc.balanceOf(userAddress)
//   console.log(`startBalance: ${startBalance.toString()}`)
//   if (inputAmount.gt(startBalance)) {
//     const shortfall = inputAmount.sub(startBalance)
//     await usdc.mint(shortfall, { from: userAddress })
//     const newBalance = await usdc.balanceOf(userAddress)
//     t.is(newBalance.toString(), inputAmount.toString())
//   }
//   t.pass()
// })
