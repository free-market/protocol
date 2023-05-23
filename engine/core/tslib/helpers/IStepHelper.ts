import type { EIP1193Provider } from 'eip1193-provider'
import type { EncodedWorkflowStep } from '../runner/EncodedWorkflow'
import type { Amount, AssetAmount, AssetReference, Chain, StepBase } from '../model'
import { ZodType } from 'zod'

export interface BridgeTarget {
  chain: Chain
  firstStepId: string
}

export interface NextSteps {
  sameChain: string[]
  differentChains?: [
    {
      chain: Chain
      stepId: string
    }
  ]
}

export interface EncodingContext<T> {
  userAddress: string
  chain: Chain
  stepConfig: T
  mapStepIdToIndex: Map<string, number>
}

export interface RemittanceInfo {
  asset: AssetReference
  amount: Amount
  source: 'caller' | 'workflow'
}
export interface IStepHelper<T extends StepBase> {
  requiresRemittance(stepConfig: T): boolean
  getRemittance(stepConfig: T): Promise<RemittanceInfo | null>
  getBridgeTarget(stepConfig: T): BridgeTarget | null
  encodeWorkflowStep(context: EncodingContext<T>): Promise<EncodedWorkflowStep>
  getPossibleNextSteps(stepConfig: T): NextSteps | null
  setProvider(provider: EIP1193Provider): void
  getAddAssetInfo(stepConfig: T): Promise<AssetAmount[]>
}

interface StepProperties {
  label: string
  description: string
}

export function stepProperties(label: string, description: string, operation?: string): string {
  return JSON.stringify({ label, description, ...(operation && { operation }) })
}

export function getStepMeta(schema: ZodType<any>): StepProperties | undefined {
  if (!schema.description) {
    return undefined
  }
  return JSON.parse(schema.description)
}
