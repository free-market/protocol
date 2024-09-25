import type { EIP1193Provider } from 'eip1193-provider'
import type { IStepHelper } from '@freemarket/core'

import type { IWorkflowInstance } from './IWorkflowInstance'
import { AaveSupplyHelper, AaveBorrowHelper, AaveRepayHelper } from '@freemarket/aave'
import { STEP_TYPE_AAVE_SUPPLY } from '@freemarket/core/tslib/step-ids'
import { AddAssetHelper } from '@freemarket/add-asset'
import { StargateBridgeHelper } from '@freemarket/stargate-bridge'
import { WrapNativeHelper, UnwrapNativeHelper } from '@freemarket/wrapped-native'
import { UniswapExactInHelper, UniswapExactOutHelper } from '@freemarket/uniswap'
import { CurveTriCrypto2SwapHelper } from '@freemarket/curve'
import { AssetBalanceBranchHelper, ChainBranchHelper, PreviousOutputBranchHelper } from '@freemarket/base-branches'
import { StubHelper } from '@freemarket/roadmap'

interface StepHelperConstructor {
  new (runner: IWorkflowInstance, provider?: EIP1193Provider): IStepHelper<any>
}

const stepHelpersConstructors: Record<string, StepHelperConstructor> = {
  'aave-supply': AaveSupplyHelper,
  'aave-borrow': AaveBorrowHelper,
  'aave-repay': AaveRepayHelper,
  'add-asset': AddAssetHelper,
  'chain-branch': ChainBranchHelper,
  'asset-balance-branch': AssetBalanceBranchHelper,
  'stargate-bridge': StargateBridgeHelper,
  'wrap-native': WrapNativeHelper,
  'unwrap-native': UnwrapNativeHelper,
  'uniswap-exact-in': UniswapExactInHelper,
  'uniswap-exact-out': UniswapExactOutHelper,
  'curve-tricrypto2-swap': CurveTriCrypto2SwapHelper,
  'previous-output-branch': PreviousOutputBranchHelper,
  '1inch': StubHelper,
}

export function createStepHelper(type: string, runner: IWorkflowInstance) {
  const ctor = stepHelpersConstructors[type]
  if (ctor) {
    return new ctor(runner)
  }
  throw new Error('no helper for type: ' + type)
}
