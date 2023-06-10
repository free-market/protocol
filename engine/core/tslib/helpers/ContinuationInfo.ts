import { AssetAmount } from '../model/AssetAmount'
import { Chain } from '../model/Chain'

export interface ContinuationInfo {
  stepType: string
  nonce: string
  targetChain: Chain
  expectedAssets: AssetAmount[]
  continuationWorkflow: string
}
