import type { EIP1193Provider } from 'eip1193-provider'
import type { IStepHelper } from './IStepHelper'
import { AaveSupplyHelper } from './AaveSupplyHelper'
import { AddAssetHelper } from './AddAssetHelper'
import { ChainBranchHelper } from './ChainBranchHelper'
import { StargateBridgeHelper } from './StargateBridgeHelper'
import type { IWorkflowInstance } from '../runner/IWorkflowInstance'

interface StepHelperConstructor {
  new (runner: IWorkflowInstance, provider?: EIP1193Provider): IStepHelper<any>
}

const stepHelpersConstructors: Record<string, StepHelperConstructor> = {
  'aave-supply': AaveSupplyHelper,
  'add-asset': AddAssetHelper,
  'chain-branch': ChainBranchHelper,
  'stargate-bridge': StargateBridgeHelper,
}

export function createStepHelper(type: string, runner: IWorkflowInstance) {
  const ctor = stepHelpersConstructors[type]
  if (ctor) {
    return new ctor(runner)
  }
  throw new Error('no helper for type: ' + type)
}
