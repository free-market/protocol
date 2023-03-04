import z from 'zod'
import { amountSchema } from '../Amount'
import { assetAmountSchema } from '../AssetAmount'
import { chainSchema } from '../Chain'
import { hexStringSchema } from '../HexString'
import { createStepSchema } from '../StepBase'

export const stargateBridgeSchema = createStepSchema('stargate-bridge').extend({
  maxSlippagePercent: z.number().gt(0).lt(100),
  destinationChain: chainSchema,
  destinationGasUnits: amountSchema.optional(),
  destinationUserAddress: hexStringSchema,
  destinationAdditionalNative: amountSchema.optional(),
  inputAsset: assetAmountSchema,
})

export interface StargateBridge extends z.infer<typeof stargateBridgeSchema> {}
