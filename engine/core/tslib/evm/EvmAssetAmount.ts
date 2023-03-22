import type { EvmAsset } from './EvmAsset'

export interface EvmAssetAmount {
  asset: EvmAsset
  amount: number | string
}
