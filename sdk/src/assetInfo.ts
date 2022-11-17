import { AssetType, AssetInfo, Asset, ChainName } from './types'
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
    symbol: subAssetId,
  }
  ASSET_METADATA[chain][subAssetId] = newAssetInfo
}

function assetCrossChain(fromChain: string, toChain: string, symbol: string, assetInfoOverrides: Partial<AssetInfo>) {
  const baseAssetInfo = ASSET_METADATA[fromChain][symbol]
  const newAssetInfo: AssetInfo = {
    ...baseAssetInfo,
    ...assetInfoOverrides,
  }
  if (!ASSET_METADATA[toChain]) {
    ASSET_METADATA[toChain] = {}
  }
  ASSET_METADATA[toChain][symbol] = newAssetInfo
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
    symbol: subAssetId,
  }
  ASSET_METADATA[targetChain][subAssetId] = newAssetInfo
}

// TODO populate assets with real info
assetCrossChain('Ethereum', 'ZkSync', 'WBTC', {})
assetCrossChain('Ethereum', 'ZkSync', 'USDC', {})
assetCrossChain('Ethereum', 'ZkSync', 'WETH', {})

assetSubType('Solana', 'USDC', 'USDCman', { type: AssetType.Account, name: 'USDC (mango)' })
assetSubType('Solana', 'SOL', 'SOLman', { type: AssetType.Account, name: 'SOL (mango)' })
assetSubType('Solana', 'USDC', 'USDCman', { type: AssetType.Account, name: 'USDC (mango)' })

assetSubType('Ethereum', 'USDC', 'USDCaave', { type: AssetType.Account, name: 'USDC (aave)' })
assetSubType('Ethereum', 'WETH', 'WETHaave', { type: AssetType.Account, name: 'WETH (aave)' })

wormholeSubType('Ethereum', 'USDC', 'Solana', 'USDCet', { name: 'USDC (wormhole from Ethereum' })

export function getAssetInfo(asset: Asset) {
  // console.log(`getAssetInfo(${JSON.stringify(asset)})`)
  const rv = ASSET_METADATA[asset.chain][asset.symbol]
  // console.log(`getAssetInfo(${JSON.stringify(asset)}) returning ${JSON.stringify(rv)}`)
  return rv
}

export function getAssetInfoForChain(chain: ChainName) {
  // TODO optimization opportunity to pre-sort assets
  const assets = ASSET_METADATA[chain]
  const keys = Object.keys(assets)
  keys.sort()
  return keys.map(k => assets[k])
}
