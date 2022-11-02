import { WorkflowActionInfo } from '../types'

export * from './curve'
export * from './mango'
export * from './serum'
export * from './weth'
export * from './wormhole'

import { CURVE_3POOL_SWAP_INFO, CURVE_TRICRYPTO_SWAP } from './curve'
import { MANGO_DEPOSIT_INFO, MANGO_WITHDRAWAL_INFO } from './mango'
import { MARINADE_STAKE_INFO, MARINADE_UNSTAKE_INFO } from './marinade'
import { SERUM_SWAP_INFO } from './serum'
import { WETH_WRAP_INFO, WETH_UNWRAP_INFO } from './weth'
import { WORMHOLE_STEP_INFO } from './wormhole'

export function getAllStepInfos(): WorkflowActionInfo[] {
  return [
    CURVE_3POOL_SWAP_INFO,
    CURVE_TRICRYPTO_SWAP,
    MANGO_DEPOSIT_INFO,
    MANGO_WITHDRAWAL_INFO,
    MARINADE_STAKE_INFO,
    MARINADE_UNSTAKE_INFO,
    SERUM_SWAP_INFO,
    WETH_WRAP_INFO,
    WETH_UNWRAP_INFO,
    WORMHOLE_STEP_INFO,
  ]
}

const mapStepIdToStepInfo = new Map<string, WorkflowActionInfo>()

for (const stepInfo of getAllStepInfos()) {
  mapStepIdToStepInfo.set(stepInfo.actionId, stepInfo)
}

export function getStepInfo(stepId: string): WorkflowActionInfo | undefined {
  return mapStepIdToStepInfo.get(stepId)
}
