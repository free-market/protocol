import { AssetType, AssetInfo, Asset } from './types'
import ASSET_METADATA_RAW from './asset-info.json'
// export type TokenConfig = { [symbol: string]: Asset }
export type IdAssetInfo = { [id: string]: AssetInfo }
export type ChainIdAssetInfo = { [chain: string]: IdAssetInfo }

const ASSET_METADATA = ASSET_METADATA_RAW as unknown as {
  [chain: string]: {
    [assetId: string]: AssetInfo
  }
}

function assetSubType(chain: string, assetId: string, subAssetId: string, assetInfoOverrides: Partial<AssetInfo>) {
  const baseAssetInfo = ASSET_METADATA[chain][assetId]
  const newAssetInfo: AssetInfo = {
    ...baseAssetInfo,
    ...assetInfoOverrides,
  }
  ASSET_METADATA[chain][subAssetId] = newAssetInfo
}

assetSubType('Solana', 'USDC', 'USDCman', { type: AssetType.Account, name: 'USDC (mango)' })
assetSubType('Solana', 'SOL', 'SOLman', { type: AssetType.Account, name: 'SOL (mango)' })

export function getAssetInfo(asset: Asset) {
  return ASSET_METADATA[asset.chain][asset.symbol]
}
