import type { EvmInputAsset } from './EvmInputAsset'
import type { EvmAsset } from './EvmAsset'

export interface EvmWorkflowStep {
  stepId: number | string
  stepAddress: string
  inputAssets: EvmInputAsset[]
  outputAssets: EvmAsset[]
  data: string
  nextStepIndex: string | number
}
