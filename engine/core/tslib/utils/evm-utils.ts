import type { Amount, Asset, AssetAmount, AssetReference, Chain } from '../model'
import { EvmAsset, EvmAssetType, EvmInputAsset } from '../evm'
import { ADDRESS_ZERO, assert, capitalize } from '../utils'
import { AssetNotFoundError, AssetNotFoundProblem } from '../runner/AssetNotFoundError'
import type { IWorkflow } from '../runner/IWorkflow'
import type { EIP1193Provider } from 'eip1193-provider'
import { Eip1193Bridge } from '@ethersproject/experimental'
import type { Signer } from '@ethersproject/abstract-signer'
import { Provider, Web3Provider } from '@ethersproject/providers'
import Big from 'big.js'

export const HARDHAT_FORK_CHAIN = 'ethereum'

export function sdkAssetToEvmAsset(asset: Asset, chain: Chain): EvmAsset {
  if (asset.type === 'native') {
    return {
      assetType: EvmAssetType.Native,
      assetAddress: ADDRESS_ZERO,
    }
  }
  const c = translateChain(chain)
  const tokenAddress = asset.chains[c]
  if (!tokenAddress) {
    throw new AssetNotFoundError([new AssetNotFoundProblem(asset.symbol, chain)])
  }
  return {
    assetType: EvmAssetType.ERC20,
    assetAddress: tokenAddress.address,
  }
}

export const TEN_BIG = new Big(10)
export const ONE_BIG = new Big(1)
export const TWO_BIG = new Big(2)

export function percentStringToDecibips(percentString: string): number {
  let s = percentString.trim()
  if (s.endsWith('%')) {
    s = s.slice(0, s.length - 1).trim()
  }
  return parseFloat(s) * 1000
}

interface ToEvmNumberResult {
  value: string
  isPercent: boolean
}

export function toEvmNumber(input: string): ToEvmNumberResult {
  let s = input.trim()
  const isPercent = s.endsWith('%')
  if (isPercent) {
    s = s.substring(0, s.length - 1).trim()
  }
  const value = isPercent ? Math.round(parseFloat(s) * 1000).toString() : s
  return { value, isPercent }
}

export function decibipsToPercentString(decibips: number) {
  return `${decibips / 1000}%`
}

export async function sdkAssetAndAmountToEvmInputAmount(
  assetRef: AssetReference,
  amount: Amount,
  chain: Chain,
  instance: IWorkflow,
  sourceIsCaller: boolean
): Promise<EvmInputAsset> {
  let amountBn: Big
  let amountIsPercent = false
  if (typeof amount === 'string' && amount.endsWith('%')) {
    const s = amount.slice(0, amount.length - 1)
    const n = parseFloat(s) * 1000 // to decibips
    amountBn = new Big(n)
    amountIsPercent = true
  } else {
    if (typeof amount === 'bigint') {
      amountBn = new Big(amount.toString())
    } else {
      amountBn = new Big(amount)
    }
    const asset = await instance.dereferenceAsset(assetRef, chain)
    if (asset.type === 'native') {
      amountBn = amountBn.mul(TEN_BIG.pow(18))
    } else {
      const c = translateChain(chain)
      const tokenInfo = asset.chains[c]
      assert(tokenInfo)
      const decimals = tokenInfo.decimals
      amountBn = amountBn.mul(TEN_BIG.pow(decimals))
    }
  }

  const asset = await instance.dereferenceAsset(assetRef, chain)
  return {
    asset: sdkAssetToEvmAsset(asset, chain),
    amount: amountBn.toFixed(),
    amountIsPercent,
    sourceIsCaller,
  }
}
export function sdkAssetAmountToEvmInputAmount(
  assetAmount: AssetAmount,
  chain: Chain,
  instance: IWorkflow,
  sourceIsCaller: boolean
): Promise<EvmInputAsset> {
  return sdkAssetAndAmountToEvmInputAmount(assetAmount.asset, assetAmount.amount, chain, instance, sourceIsCaller)
}

export async function getChainId(provider: EIP1193Provider): Promise<number> {
  const ethersProvider = getEthersProvider(provider)
  const network = await ethersProvider.getNetwork()
  return network.chainId
}

export async function getChainFromProvider(provider: EIP1193Provider): Promise<Chain> {
  const chainId = await getChainId(provider)
  return getChainFromId(chainId)
}

export function getChainFromId(chainId: number): Chain {
  switch (chainId) {
    case 1:
      return 'ethereum'
    case 5:
      return 'ethereumGoerli'
    case 56:
    case 97:
      return 'binance'
    case 42161:
    case 421613:
      return 'arbitrum'
    case 137:
    case 80001:
      return 'polygon'
    case 43114:
    case 43113:
      return 'avalanche'
    case 10:
    case 420:
      return 'optimism'
    case 250:
    case 4002:
      return 'fantom'
    case 31337:
      return 'local'
    default:
      throw new Error('unknown chainId: ' + chainId)
  }
}

export function getChainIdFromChain(chain: Chain, isTestNet: boolean) {
  if (isTestNet) {
    switch (chain) {
      case 'ethereum':
      case 'ethereumGoerli':
        return 5
      case 'binance':
        return 97
      case 'arbitrum':
        return 421613
      case 'polygon':
        return 80001
      case 'avalanche':
        return 43113
      case 'optimism':
        return 420
      case 'fantom':
        return 4002
    }
  } else {
    switch (chain) {
      case 'ethereum':
        return 1
      case 'ethereumGoerli':
        return 5
      case 'binance':
        return 56
      case 'arbitrum':
        return 42161
      case 'polygon':
        return 137
      case 'avalanche':
        return 43114
      case 'optimism':
        return 10
      case 'fantom':
        return 250
      case 'hardhat':
        return 31337
    }
  }
}

export async function isTestNetByProvider(provider: EIP1193Provider): Promise<boolean> {
  const chainId = await getChainId(provider)
  return isTestNetById(chainId)
}

export function isTestNetById(chainId: number) {
  switch (chainId) {
    case 1:
    case 31337:
    case 56:
    case 42161:
    case 137:
    case 43114:
    case 10:
    case 250:
      return false
    case 5:
    case 97:
    case 421613:
    case 80001:
    case 43113:
    case 420:
    case 4002:
      return true

    default:
      throw new Error('unknown chainId: ' + chainId)
  }
}

export function getEthersSigner(provider: EIP1193Provider): Signer {
  if (provider instanceof Eip1193Bridge) {
    return provider.signer
  }
  if ((<any>provider).wallet) {
    return (<any>provider).wallet
  }
  return new Web3Provider(provider).getSigner()
}
export function getEthersProvider(provider: EIP1193Provider): Provider {
  if (provider instanceof Eip1193Bridge) {
    return provider.provider
  }
  return new Web3Provider(provider)
}

export function translateChain(chain: Chain): Chain {
  return chain === 'hardhat' || chain === 'local' ? HARDHAT_FORK_CHAIN : chain
}

export function getChainDisplayName(chainId: string | null) {
  if (chainId === null) {
    return ''
  }
  let s = chainId
  if (s.startsWith('0x')) {
    s = s.slice(2)
  }
  const chainNum = parseInt(s, 16)
  const chain = getChainFromId(chainNum)
  return capitalize(chain)
}

export function shortAddress(address: string | undefined | null) {
  if (address === undefined || address === null) {
    return ''
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
