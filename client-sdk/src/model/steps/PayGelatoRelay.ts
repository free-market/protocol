import { absoluteAmountSchema, createStepSchema, nonEmptyStringSchema, stepProperties } from '@freemarket/core'

export const payGelatoRelaySchema = createStepSchema('gelato-relay-pay').extend({
  gasLimit: absoluteAmountSchema.describe(stepProperties('Gas Limit', 'the asset to compare against')),
  paymentAsset: nonEmptyStringSchema.describe(stepProperties('Asset Symbol', 'the asset to compare against')),
})
