import { InputAsset } from './InputAsset'
import { Asset } from './Asset'

export interface WorkflowStep {
  actionId: number | string
  actionAddress: string
  inputAssets: InputAsset[]
  outputAssets: Asset[]
  data: string
  nextStepIndex: string | number
}
