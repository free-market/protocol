import { EIP1193Provider } from 'eip1193-provider'
import { IStepHelper } from '../IStepHelper'
import { MapWithDefault } from '../utils/MapWithDefault'
import { NoopStepHelper } from './NoOpStepHelper'
import { StargateBridgeHelper } from './StargateBridgeHelper'

interface StepHelperConstructor {
  new (provider: EIP1193Provider): IStepHelper<any>
}

const stepHelpersConstructors: Record<string, StepHelperConstructor> = {
  'stargate-bridge': StargateBridgeHelper,
}

type InnerMap = Map<EIP1193Provider, IStepHelper<any>>
const innerMapFactory = () => new Map<EIP1193Provider, IStepHelper<any>>()
const stepHelpersInstances = new MapWithDefault<string, InnerMap>(innerMapFactory)

const noopStepHelper = new NoopStepHelper()

export function getStepHelper(type: string, provider: EIP1193Provider) {
  const ctor = stepHelpersConstructors[type]
  if (ctor) {
    const typeCache = stepHelpersInstances.getWithDefault(type)
    let instance = typeCache.get(provider)
    if (!instance) {
      instance = new ctor(provider)
      typeCache.set(provider, instance)
    }
    return instance
  }
  return noopStepHelper
}
