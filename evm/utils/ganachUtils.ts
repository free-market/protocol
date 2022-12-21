import { ethers, BigNumberish, BigNumber, Signer } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import BN from 'bn.js'
import dotenv from 'dotenv'
import { FrontDoor__factory } from '../types/ethers-contracts'
import fs from 'fs'
import { EvmNetworkName, getEthConfig } from './contract-addresses'
import Web3 from 'web3'

dotenv.config()

export async function getDeployedContractAddress(providerUrl: string, contractName: string): Promise<string> {
  // can't find a way to get networkId from ethers (it supports chainId which is different)
  const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl))
  const networkId = await web3.eth.net.getId()
  const content = fs.readFileSync(`./build/contracts/${contractName}.json`).toString()
  const json = JSON.parse(content)
  return json.networks[networkId].address
}

function getProvider(signerOrProvider: Signer | Provider): Provider {
  if ('provider' in signerOrProvider) {
    return signerOrProvider.provider!
  }
  if ('getNetwork' in signerOrProvider) {
    return signerOrProvider
  }
  throw new Error('could not get signer or provider')
}

// export async function getFrontDoor(signerOrProvider: Signer | Provider, address?: string) {
//   const provider = getProvider(signerOrProvider)
//   const addr = address || (await getDeployedContractAddress(provider, 'FrontDoor'))
//   return FrontDoor__factory.connect(addr, signerOrProvider)
// }

export function getTestWallet(testAccountIndex: number, provider: ethers.providers.Provider): ethers.Wallet {
  const mnemonic = process.env['FMP_GANACHE_MNEMONIC']
  if (!mnemonic) {
    throw new Error('FMP_GANACHE_MNEMONIC environment variable not')
  }
  console.log('FMP_GANACHE_MNEMONIC', mnemonic)
  const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic)
  const account = new ethers.Wallet(hdNode.derivePath(`m/44'/60'/0'/0/${testAccountIndex}`).privateKey, provider)
  account.connect(provider)
  return account
}

export function toBN(value: BigNumberish): BN {
  const hex = BigNumber.from(value).toHexString()
  if (hex[0] === '-') {
    return new BN('-' + hex.substring(3), 16)
  }
  return new BN(hex.substring(2), 16)
}

export function formatBN(bn: BN, decimals: number) {
  const decs = new BN(decimals)
  const divisor = new BN(10).pow(decs)
  return `${bn.div(divisor).toString()}.${bn.mod(divisor).toString()}`
}

export function formatBigNumber(value: BigNumber, decimals: number) {
  return formatBN(toBN(value), decimals)
}

export async function printGasFromTransaction(provider: Provider, tx: ethers.ContractTransaction, message: string) {
  const txReceipt = await provider.getTransactionReceipt(tx.hash)
  printGasFromReceipt(txReceipt, message)
}
export function printGasFromReceipt(txReceipt: ethers.ContractReceipt, message: string) {
  console.log(`${message}: ${txReceipt.gasUsed}`)
}
