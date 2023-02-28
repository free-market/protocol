// import { ethers, BigNumberish, BigNumber, Signer } from 'ethers'
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { Provider } from '@ethersproject/providers'
import { Signer } from '@ethersproject/abstract-signer'
import { Wallet } from '@ethersproject/wallet'
import { HDNode } from '@ethersproject/hdnode'
import { ContractReceipt, ContractTransaction } from '@ethersproject/contracts'

import BN from 'bn.js'
import dotenv from 'dotenv'
import fs from 'fs'
import Web3 from 'web3'

dotenv.config()


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

export async function printGasFromTransaction(provider: Provider, tx: ContractTransaction, message: string) {
  const txReceipt = await provider.getTransactionReceipt(tx.hash)
  printGasFromReceipt(txReceipt, message)
}
export function printGasFromReceipt(txReceipt: ContractReceipt, message: string) {
  console.log(`${message}: ${txReceipt.gasUsed}`)
}
