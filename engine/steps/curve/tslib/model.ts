import z from 'zod'
import { amountSchema, createStepSchema, assetReferenceSchema, assetSourceSchema, stepProperties } from '@freemarket/core'

export const curveTriCrypto2SwapSchema = createStepSchema('curve-tricrypto2-swap').extend({
  inputAsset: assetReferenceSchema,
  inputAmount: amountSchema,
  source: assetSourceSchema.describe(stepProperties('Source', 'The source of the input asset.')),
  outputAsset: assetReferenceSchema,
})

export interface CurveTriCrypto2Swap extends z.infer<typeof curveTriCrypto2SwapSchema> {}
