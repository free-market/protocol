import z from 'zod'
import { amountSchema, assetAmountSchema, chainSchema, addressSchema, createStepSchema, assetReferenceSchema } from '@freemarket/core'

export const stargateBridgeSchema = createStepSchema('stargate-bridge').extend({
  maxSlippagePercent: z.number().gt(0).lt(100).describe('The maximum amount of loss during the swap.'),
  destinationChain: chainSchema,
  destinationGasUnits: amountSchema,
  destinationUserAddress: addressSchema.optional(),
  destinationAdditionalNative: amountSchema.optional(),
  inputAsset: assetAmountSchema,
  outputAsset: assetReferenceSchema.optional(),
})

export interface StargateBridge extends z.infer<typeof stargateBridgeSchema> {}
