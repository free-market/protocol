import type { EIP1193Provider } from 'eip1193-provider'
import type { EncodedBeforeAfter, EncodedWorkflowStep } from '../runner/EncodedWorkflow'
import type { Amount, AssetAmount, AssetReference, Chain, StepBase } from '../model'
import type { ZodType } from 'zod'
import type { ContinuationInfo } from './ContinuationInfo'

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
  isDebug?: boolean
}

// used in beforeAll and afterAll, same aas EncodingContext except stepConfig is an array
export interface MultiStepEncodingContext<T> extends Omit<EncodingContext<T>, 'stepConfig'> {
  stepConfigs: T[]
}

export interface RemittanceInfo {
  asset: AssetReference
  amount: Amount
  source: 'caller' | 'workflow'
}

export interface EncodeContinuationResult {
  toAddress: string
  fromAddress: string
  callData: string
  // TODO startAssets not needed?
  startAssets: {
    address: string
    amount: string
  }[]
}

export interface BeforeAfterResult {
  beforeAll: EncodedBeforeAfter | null
  afterAll: EncodedBeforeAfter | null
}

export interface IStepHelper<T extends StepBase> {
  requiresRemittance(stepConfig: T): boolean
  getRemittance(stepConfig: T): Promise<RemittanceInfo | null>
  getBridgeTarget(stepConfig: T): BridgeTarget | null
  encodeWorkflowStep(context: EncodingContext<T>): Promise<EncodedWorkflowStep>
  getPossibleNextSteps(stepConfig: T): NextSteps | null
  setProvider(provider: EIP1193Provider): void
  getAddAssetInfo(stepConfig: T): Promise<AssetAmount[]>
  encodeContinuation(continuationInfo: ContinuationInfo): Promise<EncodeContinuationResult>
  getBeforeAfterAll(context: MultiStepEncodingContext<T>): Promise<BeforeAfterResult | null>
}

interface StepProperties {
  label: string
  description: string
}

export function stepProperties(label: string, description: string): string {
  return JSON.stringify({ label, description })
}

export function getStepMeta(schema: ZodType<any>): StepProperties | undefined {
  if (!schema.description) {
    return undefined
  }
  return JSON.parse(schema.description)
}
