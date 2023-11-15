import { EIP1193Provider } from 'eip1193-provider'
import frontDoorAddressesJson from '@freemarket/runner/deployments/front-doors.json'
import configManagerAddressesJson from '@freemarket/runner/deployments/config-managers.json'
import { Chain, decibipsToPercentString, getEthersProvider } from '@freemarket/core'
import { ConfigManager, ConfigManager__factory, FrontDoor__factory } from '@freemarket/runner'
import { removeArrayElementByValue } from './remove-array-element-by-value'

export interface StepDeploymentInfo {
  stepTypeId: number
  name: string
  current: string
  former: string[]
  fee: string
}

export interface EngineDeploymentInfo {
  frontDoor: string
  configManager: string
  currentRunner: string
  formerRunners: string[]
  steps: StepDeploymentInfo[]
  defaultFee: string
  subscribers: string[]
}

export function getConfigManagerAddress(chain: Chain) {
  return (<any>configManagerAddressesJson)[chain]
}

export async function getDeploymentInfo(chain: string, provider: EIP1193Provider): Promise<EngineDeploymentInfo | null> {
  const frontDoor = (<any>frontDoorAddressesJson)[chain]
  if (!frontDoor) {
    return null
  }
  const configManager = (<any>configManagerAddressesJson)[chain]
  const fd = FrontDoor__factory.connect(frontDoor, getEthersProvider(provider))
  const currentRunner = await fd.getUpstream()
  const cm = ConfigManager__factory.connect(configManager, getEthersProvider(provider))
  const stepCount = await cm.getStepCount()
  const steps: StepDeploymentInfo[] = []
  const defaultFeePromise = cm.getDefaultFee()
  for (let i = 0; i < stepCount.toNumber(); ++i) {
    const x = await getStepInfo(i, cm)
    steps.push(x)
  }
  const subscribers = await cm.getSubscribers()
  // const steps = await Promise.all(range(stepCount.toNumber()).map(i => getStepInfo(i, cm)))
  const formerRunners = removeArrayElementByValue(await cm.getRunnerAddresses(), currentRunner)
  const [defaultFeeNumber, defaultFeeIsPercent] = await defaultFeePromise
  const defaultFee = defaultFeeIsPercent ? decibipsToPercentString(defaultFeeNumber.toNumber()) : defaultFeeNumber.toString()

  return {
    frontDoor,
    configManager,
    currentRunner,
    formerRunners,
    steps,
    defaultFee,
    subscribers,
  }
}

async function getStepInfo(index: number, cm: ConfigManager): Promise<StepDeploymentInfo> {
  const stepInfo = await cm.getStepInfoAt(index)

  return {
    stepTypeId: stepInfo.stepTypeId,
    current: stepInfo.latest,
    former: removeArrayElementByValue(stepInfo.whitelist, stepInfo.latest),
    fee: stepInfo.feeIsPercent ? decibipsToPercentString(stepInfo.fee.toNumber()) : stepInfo.fee.toString(),
    name: 'TODO',
  }
}
