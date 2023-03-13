import type { Asset, AssetAmount, Chain } from '../model'
import { Asset as EvmAsset, AssetType, InputAsset } from '@freemarket/evm'
import { ADDRESS_ZERO } from '../helpers/utils'
import { AssetNotFoundError, AssetNotFoundProblem } from '../runner/AssetNotFoundError'
import type { IWorkflowInstance } from '../runner/IWorkflowInstance'
import type { EIP1193Provider } from 'eip1193-provider'
import { Eip1193Bridge } from '@ethersproject/experimental'
import type { Signer } from '@ethersproject/abstract-signer'
import { Provider, Web3Provider } from '@ethersproject/providers'

export function sdkAssetToEvmAsset(asset: Asset, chain: Chain): EvmAsset {
  if (asset.type === 'native') {
    return {
      assetType: AssetType.Native,
      assetAddress: ADDRESS_ZERO,
    }
  }
  const tokenAddress = asset.chains[chain]
  if (!tokenAddress) {
    throw new AssetNotFoundError([new AssetNotFoundProblem(asset.symbol, chain)])
  }
  return {
    assetType: AssetType.ERC20,
    assetAddress: tokenAddress.address,
  }
}

export async function sdkAssetAmountToEvmInputAmount(
  assetAmount: AssetAmount,
  chain: Chain,
  runner: IWorkflowInstance
): Promise<InputAsset> {
  let amountStr: string
  let amountIsPercent = false
  if (typeof assetAmount.amount === 'number') {
    amountStr = assetAmount.amount.toFixed(0)
  } else if (typeof assetAmount.amount === 'bigint') {
    amountStr = assetAmount.amount.toString()
  } else {
    if (assetAmount.amount.endsWith('%')) {
      const s = assetAmount.amount.slice(0, assetAmount.amount.length - 1)
      const n = parseFloat(s) * 100000 // to decibips
      amountStr = n.toFixed(0)
      amountIsPercent = true
    } else {
      amountStr = assetAmount.amount
    }
  }
  const asset = await runner.dereferenceAsset(assetAmount.asset, chain)
  return {
    asset: sdkAssetToEvmAsset(asset, chain),
    amount: amountStr,
    amountIsPercent,
  }
}

export async function getChainId(provider: EIP1193Provider): Promise<number> {
  const ethersProvider = getEthersProvider(provider)
  const network = await ethersProvider.getNetwork()
  return network.chainId
}

export async function getChain(provider: EIP1193Provider): Promise<Chain> {
  const chainId = await getChainId(provider)
  switch (chainId) {
    case 1:
    case 5:
      return 'ethereum'
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
    default:
      throw new Error('unknown chainId: ' + chainId)
  }
}

export async function isTestNet(provider: EIP1193Provider): Promise<boolean> {
  const chainId = await getChainId(provider)
  switch (chainId) {
    case 1:
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

export function getEthersSigner(provider: EIP1193Provider): Signer | null {
  if (provider instanceof Eip1193Bridge) {
    return provider.signer
  }
  return null
}
export function getEthersProvider(provider: EIP1193Provider): Provider {
  if (provider instanceof Eip1193Bridge) {
    return provider.provider
  }
  return new Web3Provider(provider)
}
