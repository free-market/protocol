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

function wormholeSubType(
  sourceChain: string,
  assetId: string,
  targetChain: string,
  subAssetId: string,
  assetInfoOverrides: Partial<AssetInfo>
) {
  const baseAssetInfo = ASSET_METADATA[sourceChain][assetId]
  const newAssetInfo: AssetInfo = {
    ...baseAssetInfo,
    ...assetInfoOverrides,
  }
  ASSET_METADATA[targetChain][subAssetId] = newAssetInfo
}

assetSubType('Solana', 'USDC', 'USDCman', { type: AssetType.Account, name: 'USDC (mango)' })
assetSubType('Solana', 'SOL', 'SOLman', { type: AssetType.Account, name: 'SOL (mango)' })
assetSubType('Solana', 'USDC', 'USDCman', { type: AssetType.Account, name: 'USDC (mango)' })
wormholeSubType('Ethereum', 'USDC', 'Solana', 'USDCet', { name: 'USDC (wormhole from Ethereum' })

export function getAssetInfo(asset: Asset) {
  // console.log(`getAssetInfo(${JSON.stringify(asset)})`)
  const rv = ASSET_METADATA[asset.chain][asset.symbol]
  // console.log(`getAssetInfo(${JSON.stringify(asset)}) returning ${JSON.stringify(rv)}`)
  return rv
}
