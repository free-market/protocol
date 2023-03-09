import type { Asset } from './Asset'

export interface AssetAmount {
  asset: Asset
  amount: number | string
}
