import type { EvmAssetAmount } from './EvmAssetAmount'

export interface EvmInputAsset extends EvmAssetAmount {
  amountIsPercent: boolean
}
