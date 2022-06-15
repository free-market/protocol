import { ethers, BigNumberish, BigNumber, Signer } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import BN from 'bn.js'
import dotenv from 'dotenv'
import {
  Curve3Pool__factory,
  CurveTriCrypto,
  CurveTriCrypto__factory,
  FrontDoor__factory,
  IERC20__factory,
  Weth__factory,
} from '../types/ethers-contracts'
import fs from 'fs'

dotenv.config()

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const CURVE_THREEPOOL_ADDRESS = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7'
const CURVE_TRICRYPTO_ADDRESS = '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5'

export function getMainNetContracts(signerOrProvider: Signer | Provider) {
  return {
    weth: Weth__factory.connect(WETH_ADDRESS, signerOrProvider),
    curveTriCrypto: CurveTriCrypto__factory.connect(CURVE_TRICRYPTO_ADDRESS, signerOrProvider),
    curve3Pool: Curve3Pool__factory.connect(CURVE_THREEPOOL_ADDRESS, signerOrProvider),
    usdt: IERC20__factory.connect(USDT_ADDRESS, signerOrProvider),
    usdc: IERC20__factory.connect(USDC_ADDRESS, signerOrProvider),
  }
}

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

let gasLimit: BigNumberish = BigNumber.from('2000000')

export function setDefaultGasLimit(newGasLimit: BigNumberish) {
  gasLimit = newGasLimit
}

const PADDING = 50
const WAITS = 1

export async function transferEthToUsdc(wallet: ethers.Wallet, amountInWei: BigNumberish, verbose?: boolean) {
  const { weth, curveTriCrypto, curve3Pool, usdt, usdc } = getMainNetContracts(wallet)

  verbose && console.log(`${'depositing eth into weth, amount='.padEnd(PADDING)}${amountInWei.toString()}`)
  const _wethDepositResult = await weth.deposit({ from: wallet.address, value: amountInWei, gasLimit })
  const wethBalance = await weth.balanceOf(wallet.address, { gasLimit })
  verbose && console.log(`${'weth balance'.padEnd(PADDING)}${wethBalance.toString()}`)
  const _wethApproveResult = await (await weth.approve(curveTriCrypto.address, wethBalance, { gasLimit })).wait(WAITS)

  const wethAllowance = await weth.allowance(wallet.address, curveTriCrypto.address, { gasLimit })
  verbose && console.log('tricrypto.exchange weth->usdt allowance='.padEnd(PADDING) + wethAllowance.toString())
  const _triCrytpoResult = await (
    await curveTriCrypto['exchange(uint256,uint256,uint256,uint256)'](2, 0, wethAllowance, 1, { gasLimit })
  ).wait(WAITS)

  const usdtAmount = await usdt.balanceOf(wallet.address)
  verbose && console.log('usdt amount after tricrytpo.exchange'.padEnd(PADDING) + usdtAmount.toString())
  const _usdtApproveResult = await (await usdt.approve(curve3Pool.address, usdtAmount, { gasLimit })).wait(WAITS)
  const usdtAllowanceResult = await usdt.allowance(wallet.address, curve3Pool.address)
  verbose && console.log('3pool.exchange usdt-usdc allowance='.padEnd(PADDING) + usdtAllowanceResult.toString())
  verbose && console.log('usdt balance before 3pool.exchange='.padEnd(PADDING) + usdtAmount.toString())
  const _threePoolExchangeResult = await (await curve3Pool.exchange(2, 1, usdtAmount, 1, { gasLimit })).wait(WAITS)
  const usdcAmount = await usdc.balanceOf(wallet.address, { gasLimit })
  verbose && console.log('usdc after 3pool.exchange '.padEnd(PADDING) + usdcAmount.toString())
  return usdcAmount
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

// async function go() {
//   const provider = new ethers.providers.JsonRpcProvider()
//   const _network = await provider.ready
//   const wallet0 = getTestWallet(0, provider)
//   const wallet1 = getTestWallet(1, provider)
//   const wallet9 = getTestWallet(9, provider)

//   // configure the contract
//   const fmpOwner = getFreeMarketContract(wallet0)
//   const tx2 = await fmpOwner.setBusStop(wallet9.address)
//   const supportedAddrs = await fmpOwner.getSupportedERC20Tokens()
//   if (!supportedAddrs.includes(USDC_ADDRESS)) {
//     const tx = await fmpOwner.addSupportedERC20Token(USDC_ADDRESS)
//   }

//   // set up user 1 with some usdc
//   const startingBalance = await provider.getBalance(wallet1.address);
//   console.log('starting eth ' + startingBalance.toString())
//   const usdcAmount = await transferEthToUsdc(wallet1, '100000000000000000', true)
//   const usdcUser1 = getMainNetContracts(wallet1).usdc
//   const decimals = await usdcUser1.decimals()
//   console.log('final usdc ' + formatBigNumber(usdcAmount, decimals))

//   const fmpUser = getFreeMarketContract(wallet1)
//   await usdcUser1.approve(fmpUser.address, usdcAmount)
//   await fmpUser.deposit(USDC_ADDRESS, usdcAmount)

//   const usdcAmountAfterUser1 = await usdcUser1.balanceOf(wallet1.address, { gasLimit })
//   const usdcAmountAfterUser9 = await usdcUser1.balanceOf(wallet9.address, { gasLimit })
//   console.log('omg')
// }

// void go()
