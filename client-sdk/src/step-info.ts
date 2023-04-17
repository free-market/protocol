import { StepInfo } from '@freemarket/step-sdk'
import { stepInfo as addAssetStepInfo } from '@freemarket/add-asset/build/tslib/step-info'
import { stepInfos as aaveStepInfos } from '@freemarket/aave/build/tslib/step-info'
import { stepInfos as baseBranchStepInfos } from '@freemarket/base-branches/build/tslib/step-info'
import { stepInfos as curveStepInfos } from '@freemarket/curve/build/tslib/step-info'
import { stepInfo as stargateBridgeStepInfo } from '@freemarket/stargate-bridge/build/tslib/step-info'
import { wrapNativeStepInfo, unwrapNativeStepInfo } from '@freemarket/wrapped-native/build/tslib/step-info'
import { stepInfo as uniswapStepInfo } from '@freemarket/uniswap/build/tslib/step-info'
export { StepInfo }

export function getStepInfos(): StepInfo[] {
  return [
    addAssetStepInfo,
    ...aaveStepInfos,
    ...baseBranchStepInfos,
    ...curveStepInfos,
    stargateBridgeStepInfo,
    wrapNativeStepInfo,
    unwrapNativeStepInfo,
    uniswapStepInfo,
  ]
}
