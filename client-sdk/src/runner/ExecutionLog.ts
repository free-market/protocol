import { Asset } from '@freemarket/core'

export interface ExecutionStepLogAsset {
  symbol: string
  address: string
  amount: string
  assetInfo?: Asset
}

export interface ExecutionStepLog {
  stepTyeId: number
  inputAssets: ExecutionStepLogAsset[]
  outputAssets: ExecutionStepLogAsset[]
}
