import type { EIP1193Provider } from 'eip1193-provider'
import type { IStepHelper } from './IStepHelper'
import { MapWithDefault } from '../utils/MapWithDefault'
import { AaveSupplyHelper } from './AaveSupplyHelper'
import { AddAssetHelper } from './AddAssetHelper'
// import { AddAssetHelper2 } from './AddAssetHelper2'
import { ChainBranchHelper } from './ChainBranchHelper'
import { StargateBridgeHelper } from './StargateBridgeHelper'
import type { IWorkflowRunner } from '../runner/IWorkflowRunner'

interface StepHelperConstructor {
  new (runner: IWorkflowRunner, provider?: EIP1193Provider): IStepHelper<any>
}

const stepHelpersConstructors: Record<string, StepHelperConstructor> = {
  'aave-supply': AaveSupplyHelper,
  'add-asset': AddAssetHelper,
  'chain-branch': ChainBranchHelper,
  'stargate-bridge': StargateBridgeHelper,
}

type InnerMap = Map<EIP1193Provider | undefined, IStepHelper<any>>
const innerMapFactory = () => new Map<EIP1193Provider | undefined, IStepHelper<any>>()
const stepHelpersInstances = new MapWithDefault<string, InnerMap>(innerMapFactory)

export function getStepHelper(type: string, runner: IWorkflowRunner, provider?: EIP1193Provider) {
  const ctor = stepHelpersConstructors[type]
  if (ctor) {
    const typeCache = stepHelpersInstances.getWithDefault(type)
    let instance = typeCache.get(provider)
    if (!instance) {
      instance = new ctor(runner, provider)
      typeCache.set(provider, instance)
    }
    return instance
  }
  throw new Error('no helper for type: ' + type)
}

export function createStepHelper(type: string, runner: IWorkflowRunner) {
  const ctor = stepHelpersConstructors[type]
  if (ctor) {
    return new ctor(runner)
  }
  throw new Error('no helper for type: ' + type)
}
