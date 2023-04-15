import { StepInfo } from '@freemarket/step-sdk'
import { stepInfo as addAssetStepInfo } from '@freemarket/add-asset/build/tslib/step-info'
import { stepInfo as aaveStepInfo } from '@freemarket/aave/build/tslib/step-info'
import { chainBranchStepInfo, assetBalanceBranchStepInfo } from '@freemarket/base-branches/build/tslib/step-info'
import { stepInfo as curveStepInfo } from '@freemarket/curve/build/tslib/step-info'
import { stepInfo as stargateBridgeStepInfo } from '@freemarket/stargate-bridge/build/tslib/step-info'
import { wrapNativeStepInfo, unwrapNativeStepInfo } from '@freemarket/wrapped-native/build/tslib/step-info'
import { stepInfo as uniswapStepInfo } from '@freemarket/uniswap/build/tslib/step-info'
export { StepInfo }

export function getStepInfos(): StepInfo[] {
  return [
    addAssetStepInfo,
    aaveStepInfo,
    chainBranchStepInfo,
    assetBalanceBranchStepInfo,
    curveStepInfo,
    stargateBridgeStepInfo,
    wrapNativeStepInfo,
    unwrapNativeStepInfo,
    uniswapStepInfo,
  ]
}
