import type { Asset, Chain } from '../model'
import { Asset as EvmAsset, AssetType } from '@freemarket/evm'
import { ADDRESS_ZERO } from '../helpers/utils'
import { AssetNotFoundError, AssetNotFoundProblem } from '../runner/AssetNotFoundError'

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
