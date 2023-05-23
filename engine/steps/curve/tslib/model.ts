import z from 'zod'
import { amountSchema, assetReferenceSchema, createStepSchema, inputAssetReferenceSchema } from '@freemarket/core'

export const curveTriCrypto2SwapSchema = createStepSchema('curve-tricrypto2-swap').extend({
  inputAsset: inputAssetReferenceSchema,
  inputAmount: amountSchema,
  outputAsset: assetReferenceSchema,
})

export interface CurveTriCrypto2Swap extends z.infer<typeof curveTriCrypto2SwapSchema> {}
