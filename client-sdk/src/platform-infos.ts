import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import { platformInfo as aavePlatformInfo } from '@freemarket/aave/build/tslib/step-info'
import { platformInfo as addAssetPlatformInfo } from '@freemarket/add-asset/build/tslib/step-info'
import {
  chainBranchPlatformInfo,
  assetBalanceBranchPlatformInfo,
  payGelatoRelayPlatform,
} from '@freemarket/base-branches/build/tslib/step-info'
// import { platformInfo as curvePlatformInfo } from '@freemarket/curve/build/tslib/step-info'
import { platformInfo as stargateBridgePlatformInfo } from '@freemarket/stargate-bridge/build/tslib/step-info'
import { platformInfo as uniswapPlatformInfo } from '@freemarket/uniswap/build/tslib/step-info'
import { platformInfo as wrappedNativePlatformInfo } from '@freemarket/wrapped-native/build/tslib/step-info'

export { PlatformInfo, StepInfo } from '@freemarket/step-sdk'

export function getPlatformInfos(): PlatformInfo[] {
  return [
    aavePlatformInfo,
    // addAssetPlatformInfo,
    assetBalanceBranchPlatformInfo,
    chainBranchPlatformInfo,
    // curvePlatformInfo,
    payGelatoRelayPlatform,
    stargateBridgePlatformInfo,
    uniswapPlatformInfo,
    wrappedNativePlatformInfo,
  ]
}
