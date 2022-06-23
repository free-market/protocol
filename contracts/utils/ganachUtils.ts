import { ethers, BigNumberish, BigNumber, Signer } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import BN from 'bn.js'
import dotenv from 'dotenv'
import { FrontDoor__factory, IERC20__factory, Weth__factory } from '../types/ethers-contracts'
import fs from 'fs'

dotenv.config()

export function getDeployedContractAddress(contractName: string): string {
  const content = fs.readFileSync(`./build/contracts/${contractName}.json`).toString()
  const json = JSON.parse(content)
  return json.networks['1'].address
}

export function getFrontDoor(signerOrProvider: Signer | Provider, address?: string) {
  const addr = address || getDeployedContractAddress('FrontDoor')
  return FrontDoor__factory.connect(addr, signerOrProvider)
}

export function getTestWallet(testAccountIndex: number, provider: ethers.providers.Provider): ethers.Wallet {
  const mnemonic = process.env['FMP_GANACHE_MNEMONIC']
  if (!mnemonic) {
    throw new Error('FMP_GANACHE_MNEMONIC environment variable not')
  }
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
