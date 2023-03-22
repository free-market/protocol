import type { EvmAssetType } from './EvmAssetType'

export interface EvmAsset {
  assetType: EvmAssetType
  assetAddress: string
}
