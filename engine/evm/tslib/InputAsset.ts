import type { AssetAmount } from './AssetAmount'

export interface InputAsset extends AssetAmount {
  amountIsPercent: boolean
}
