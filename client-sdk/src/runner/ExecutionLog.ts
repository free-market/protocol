import { Asset, Chain } from '@freemarket/core'
import { StepInfo } from '../platform-infos'

export interface ExecutionLogAssetAmount {
  // if it is a known asset, this will be set
  asset?: Asset
  // this will always be set
  address: string
  amount: string
}
interface ExecutionLogBase {
  chain: Chain
}

export interface ExecutionLogStep extends ExecutionLogBase {
  type: 'step'
  stepInfo: StepInfo
  inputs: ExecutionLogAssetAmount[]
  outputs: ExecutionLogAssetAmount[]
  outputsToUser: ExecutionLogAssetAmount[]
}

export interface ExecutionLogContinuation extends ExecutionLogBase {
  type: 'continuation'
  stepInfo: StepInfo
  toChain: Chain
  assetAmounts: ExecutionLogAssetAmount[]
}
export interface ExecutionLogContinuationSuccess extends ExecutionLogBase {
  type: 'continuation-success'
}
export interface ExecutionLogContinuationFailure extends ExecutionLogBase {
  type: 'continuation-failure'
  reason: string
}

export interface ExecutionLogRemainingAsset extends ExecutionLogBase {
  type: 'remaining-asset'
  assetAmount: ExecutionLogAssetAmount
  userAmount: string
  feeAmount: string
}

export type ExecutionLog =
  | ExecutionLogStep
  | ExecutionLogRemainingAsset
  | ExecutionLogContinuation
  | ExecutionLogContinuationSuccess
  | ExecutionLogContinuationFailure

// eslint-disable-next-line sonarjs/cognitive-complexity
export function getAllAssets(logs: ExecutionLog[]) {
  const seenAddresses = new Set<string>()
  const ret = new Set<ExecutionLogAssetAmount>()
  for (const log of logs) {
    switch (log.type) {
      case 'step':
        const allAssetAmounts = [...log.inputs, ...log.outputsToUser, ...log.outputsToUser]
        for (const assetAmount of allAssetAmounts) {
          if (!seenAddresses.has(assetAmount.address)) {
            seenAddresses.add(assetAmount.address)
            ret.add(assetAmount)
          }
        }
        break
      case 'continuation':
        for (const assetAmount of log.assetAmounts) {
          if (!seenAddresses.has(assetAmount.address)) {
            seenAddresses.add(assetAmount.address)
            ret.add(assetAmount)
          }
        }
        break
      case 'remaining-asset':
        if (!seenAddresses.has(log.assetAmount.address)) {
          seenAddresses.add(log.assetAmount.address)
          ret.add(log.assetAmount)
        }
        break
    }
  }
  return [...ret]
}
