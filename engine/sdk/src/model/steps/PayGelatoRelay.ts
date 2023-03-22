import { absoluteAmountSchema, assetReferenceSchema, createStepSchema } from '@freemarket/core'

export const payGelatoRelaySchema = createStepSchema('pay-gelato-relay').extend({
  gasLimit: absoluteAmountSchema,
  paymentAsset: assetReferenceSchema,
})
