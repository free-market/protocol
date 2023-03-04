import { absoluteAmountSchema } from '../Amount'
import { assetReferenceSchema } from '../AssetReference'
import { createStepSchema } from '../StepBase'

export const payGelatoRelaySchema = createStepSchema('pay-gelato-relay').extend({
  gasLimit: absoluteAmountSchema,
  paymentAsset: assetReferenceSchema,
})
