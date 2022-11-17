import { WorkflowActionInput, WorkflowStepInput } from '../builder/WorkflowBuilder'
import { WorkflowActionInfo } from '../types'

export * from './aave'
export * from './curve'
export * from './oceanDex'
export * from './oneInch'
export * from './weth'
export * from './wormhole'
export * from './zkSyncBridge'

import { AAVE_BORROW_ACTION, AAVE_STAKE_ACTION } from './aave'
import { CURVE_3POOL_SWAP_INFO, CURVE_TRICRYPTO_SWAP } from './curve'
import { WETH_WRAP_INFO, WETH_UNWRAP_INFO } from './weth'
import { WORMHOLE_STEP_INFO } from './wormhole'
import { ONEINCH_SWAP_ACTION } from './oneInch'
import { ZKSYNC_BRIDGE_ACTION } from './zkSyncBridge'
import { OCEAN_SWAP_ACTION } from './oceanDex'

export function getAllStepInfos(): WorkflowActionInfo[] {
  return [
    AAVE_BORROW_ACTION,
    AAVE_STAKE_ACTION,
    CURVE_3POOL_SWAP_INFO,
    CURVE_TRICRYPTO_SWAP,
    WETH_WRAP_INFO,
    WETH_UNWRAP_INFO,
    WORMHOLE_STEP_INFO,
    OCEAN_SWAP_ACTION,
    ONEINCH_SWAP_ACTION,
    ZKSYNC_BRIDGE_ACTION,
  ]
}

const mapActionIdToActionInfo = new Map<string, WorkflowActionInfo>()

for (const stepInfo of getAllStepInfos()) {
  mapActionIdToActionInfo.set(stepInfo.actionId, stepInfo)
}

export function getActionInfo(actionId: string): WorkflowActionInfo {
  const info = mapActionIdToActionInfo.get(actionId)
  if (!info) {
    // mapActionIdToActionInfo.forEach((v, k) => {
    //   console.log(`  key: ${k}`)
    // })
    throw new Error('action info not available actionId=' + actionId)
  }
  return info
}
export function getStepInfo(step: WorkflowStepInput): WorkflowActionInfo {
  // console.log(`entering getStepInfo(${JSON.stringify(step)})`)
  const action = step as WorkflowActionInput
  if (!action.actionId) {
    throw new Error('step info not available')
  }
  return getActionInfo(action.actionId)
}
