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
// import { ethers, BigNumberish, BigNumber, Signer, Wallet } from 'ethers'
// import { IUserProxyManager__factory, Weth__factory } from '../types/ethers-contracts'
// import { IERC20__factory } from '../types/ethers-contracts/factories/IERC20__factory'
// import type { Provider } from '@ethersproject/providers'

export async function ensureEthBalance(targetBalanceWei: BigNumber, fromWallet: Wallet, toAddress: string) {
  const targetAddressBalanceWei = await fromWallet.provider.getBalance(toAddress)
  const weiToSend = targetBalanceWei.sub(targetAddressBalanceWei)
  if (!weiToSend.isNegative() && !weiToSend.isZero()) {
    console.log(`sending ${weiToSend} ETH to ${toAddress}`)
    await fromWallet.sendTransaction({
      to: toAddress,
      value: weiToSend,
    })
    const userProxyBalanceEthAfter = await fromWallet.provider.getBalance(toAddress)
    console.log(`ETH sent, current balance: ${userProxyBalanceEthAfter}`)
  }
}

export async function getEthBalanceShortfall(targetBalanceWei: BigNumber, provider: Provider, toAddress: string): Promise<BigNumber> {
  const userProxyBalanceEth = await provider.getBalance(toAddress)
  const weiToSend = targetBalanceWei.sub(userProxyBalanceEth)
  if (!weiToSend.isNegative() && !weiToSend.isZero()) {
    return weiToSend
  }
  return BigNumber.from('0')
}

export async function getContractAddressViaProvider(providerUrl: string, contractName: string): Promise<string> {
  // can't find a way to get networkId from ethers (it supports chainId which is different)
  const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl))
  const networkId = await web3.eth.net.getId()
  return getContractAddressViaNetworkId(networkId, contractName)
}

export function getContractAddressViaNetworkId(networkId: number, contractName: string): string {
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

export function getWalletFromMnemonic(mnemonic: string, testAccountIndex: number, provider: Provider): Wallet {
  const hdNode = HDNode.fromMnemonic(mnemonic)
  const wallet = new Wallet(hdNode.derivePath(`m/44'/60'/0'/0/${testAccountIndex}`).privateKey, provider)
  wallet.connect(provider)
  return wallet
}
