import type { Asset, AssetAmount, Chain } from '../model'
import { Asset as EvmAsset, AssetAmount as EvmAssetAmount, AssetType, InputAsset } from '@freemarket/evm'
import { ADDRESS_ZERO } from '../helpers/utils'
import { AssetNotFoundError, AssetNotFoundProblem } from '../runner/AssetNotFoundError'
import type { IWorkflowRunner } from '../runner/IWorkflowRunner'

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

export async function sdkAssetAmountToEvmInputAmount(assetAmount: AssetAmount, chain: Chain, runner: IWorkflowRunner): Promise<InputAsset> {
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
