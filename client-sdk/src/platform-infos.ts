import { PlatformInfo } from '@freemarket/step-sdk'
import { platformInfo as addAssetPlatformInfo } from '@freemarket/add-asset/build/tslib/step-info'
import { platformInfo as aavePlatformInfo } from '@freemarket/aave/build/tslib/step-info'
import {
  chainBranchPlatformInfo,
  assetBalanceBranchPlatformInfo,
  previousOutputBranchPlatformInfo,
  payGelatoRelayPlatform,
} from '@freemarket/base-branches/build/tslib/step-info'
import { platformInfo as stargateBridgePlatformInfo } from '@freemarket/stargate-bridge/build/tslib/step-info'
import { platformInfo as uniswapPlatformInfo } from '@freemarket/uniswap/build/tslib/step-info'
import { platformInfo as wrappedNativePlatformInfo } from '@freemarket/wrapped-native/build/tslib/step-info'
import {
  oneInchPlatformInfo,
  stripePlatformInfo,
  telegramPlatformInfo,
  zeroExPlatformInfo,
} from '@freemarket/roadmap/build/tslib/platform-info'

export { PlatformInfo, StepInfo } from '@freemarket/step-sdk'

export function getPlatformInfos(): PlatformInfo[] {
  return [
    aavePlatformInfo,
    addAssetPlatformInfo,
    assetBalanceBranchPlatformInfo,
    chainBranchPlatformInfo,
    previousOutputBranchPlatformInfo,
    // curvePlatformInfo,
    payGelatoRelayPlatform,
    stargateBridgePlatformInfo,
    uniswapPlatformInfo,
    wrappedNativePlatformInfo,
    oneInchPlatformInfo,
    telegramPlatformInfo,
    stripePlatformInfo,
    zeroExPlatformInfo,
  ]
}
