import Big from 'big.js'
import { boolean, mixed, ObjectSchema, string, object, array } from 'yup'
import { AssetAmount, assetAmountSchema } from './AssetAmount'
import { NumberType } from './Number'

export interface StepInputAsset extends AssetAmount {
  amountIsPercent: boolean
}

export const stepInputAssetSchema: ObjectSchema<StepInputAsset> = assetAmountSchema.concat(
  object({
    amountIsPercent: boolean().required(),
  })
)

export interface WorkflowStep {
  id: string
  nextStepId: string
  stepId: string
  inputAssets?: StepInputAsset[]
  outputAssets?: AssetAmount[]
}

export const workflowStepSchema: ObjectSchema<WorkflowStep> = object({
  id: string().required(),
  nextStepId: string().required(),
  stepId: string().required(),
  inputAssets: array().of(stepInputAssetSchema),
  outputAssets: array().of(assetAmountSchema),
})

export interface AddAssetAction extends WorkflowStep {
  stepId: 'addAsset'
}
export interface StargateBridgeAction extends WorkflowStep {
  stepId: 'stargateBridge'
  minAmountOut: NumberType
}

type Step = AddAssetAction | StargateBridgeAction

const asdf: Step = {
  id: '1',
  nextStepId: '2',
  stepId: 'stargateBridge',
}
