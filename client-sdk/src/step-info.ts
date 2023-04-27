import { StepInfo } from '@freemarket/step-sdk'
import { stepInfos as addAssetStepInfos } from '@freemarket/add-asset/build/tslib/step-info'
import { stepInfos as aaveStepInfos } from '@freemarket/aave/build/tslib/step-info'
import { stepInfos as baseBranchStepInfos } from '@freemarket/base-branches/build/tslib/step-info'
import { stepInfos as curveStepInfos } from '@freemarket/curve/build/tslib/step-info'
import { stepInfo as stargateBridgeStepInfo } from '@freemarket/stargate-bridge/build/tslib/step-info'
import { stepInfos as wrappedNativeStepInfos } from '@freemarket/wrapped-native/build/tslib/step-info'
import { stepInfos as uniswapStepInfos } from '@freemarket/uniswap/build/tslib/step-info'
export { StepInfo }

export function getStepInfos(): StepInfo[] {
  return [
    ...addAssetStepInfos,
    ...aaveStepInfos,
    ...baseBranchStepInfos,
    ...curveStepInfos,
    stargateBridgeStepInfo,
    ...wrappedNativeStepInfos,
    ...uniswapStepInfos,
  ]
}
