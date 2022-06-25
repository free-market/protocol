import { ethers, BigNumberish, BigNumber, Signer, Wallet } from 'ethers'
import { IUserProxyManager__factory, IERC20__factory, Weth__factory } from '../types/ethers-contracts'
import type { Provider } from '@ethersproject/providers'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const CURVE_THREEPOOL_LPTOKEN_ADDRESS = '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490'

export function getMainNetContracts(signerOrProvider: Signer | Provider) {
  return {
    weth: Weth__factory.connect(WETH_ADDRESS, signerOrProvider),
    curve3PoolLp: IERC20__factory.connect(CURVE_THREEPOOL_LPTOKEN_ADDRESS, signerOrProvider),
    usdt: IERC20__factory.connect(USDT_ADDRESS, signerOrProvider),
    usdc: IERC20__factory.connect(USDC_ADDRESS, signerOrProvider),
  }
}

export async function getUserProxyAddress(frontDoorAddress: string, userWallet: Wallet) {
  // obtain the user's proxy address via UserProxyManager
  const userProxyManager = IUserProxyManager__factory.connect(frontDoorAddress, userWallet)
  let userProxyAddress = await userProxyManager.getUserProxy()
  if (userProxyAddress === ADDRESS_ZERO) {
    console.log('creating user proxy')
    const txResult = await userProxyManager.createUserProxy()
    const txReceipt = await userWallet.provider.getTransactionReceipt(txResult.hash)
    console.log('user proxy created, gas: ' + txReceipt.gasUsed.toString())
    userProxyAddress = await userProxyManager.getUserProxy()
  }
  console.log('user proxy address', userProxyAddress)
  return userProxyAddress
}

export async function ensureEthBalance(eth: string, fromWallet: Wallet, toAddress: string) {
  const userProxyBalanceEth = await fromWallet.provider.getBalance(toAddress)
  const targetBalance = ethers.utils.parseEther(eth)
  const weiToSend = targetBalance.sub(userProxyBalanceEth)
  if (!weiToSend.isNegative() && !weiToSend.isZero()) {
    console.log(`sending ${ethers.utils.formatEther(weiToSend)} ETH to user's proxy`)
    await fromWallet.sendTransaction({
      to: toAddress,
      value: weiToSend,
    })
    const userProxyBalanceEthAfter = await fromWallet.provider.getBalance(toAddress)
    console.log(`ETH sent to user proxy, current balance: ${ethers.utils.formatEther(userProxyBalanceEthAfter)}`)
  }
}
