import type { AssetAmount } from '../model/AssetAmount'
import type { Chain } from '../model/Chain'

export interface ContinuationInfo {
  stepType: string
  nonce: string
  targetChain: Chain
  expectedAssets: AssetAmount[]
  continuationWorkflow: string
}
