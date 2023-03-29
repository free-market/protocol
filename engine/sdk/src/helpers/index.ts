import type { EIP1193Provider } from 'eip1193-provider'
import type { IStepHelper } from '@freemarket/core'
import { ChainBranchHelper } from './ChainBranchHelper'

import type { IWorkflowInstance } from '../runner/IWorkflowInstance'
import { AaveSupplyHelper } from '@freemarket/aave'
import { AddAssetHelper } from '@freemarket/add-asset'
import { StargateBridgeHelper } from '@freemarket/stargate-bridge'
import { WrapNativeHelper } from '@freemarket/wrapped-native'
import { UniswapExactInHelper } from '@freemarket/uniswap'
import { CurveTriCrypto2SwapHelper } from '@freemarket/curve'

interface StepHelperConstructor {
  new (runner: IWorkflowInstance, provider?: EIP1193Provider): IStepHelper<any>
}

const stepHelpersConstructors: Record<string, StepHelperConstructor> = {
  'aave-supply': AaveSupplyHelper,
  'add-asset': AddAssetHelper,
  'chain-branch': ChainBranchHelper,
  'stargate-bridge': StargateBridgeHelper,
  'wrap-native': WrapNativeHelper,
  'uniswap-exact-in': UniswapExactInHelper,
  'curve-tricrypto2-swap': CurveTriCrypto2SwapHelper,
}

export function createStepHelper(type: string, runner: IWorkflowInstance) {
  const ctor = stepHelpersConstructors[type]
  if (ctor) {
    return new ctor(runner)
  }
  throw new Error('no helper for type: ' + type)
}
