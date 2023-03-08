import { InputAsset } from './InputAsset'
import { Asset } from './Asset'

export interface EvmWorkflowStep {
  stepId: number | string
  stepAddress: string
  inputAssets: InputAsset[]
  outputAssets: Asset[]
  data: string
  nextStepIndex: string | number
}
