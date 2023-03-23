import type z from 'zod'
import { assetAmountSchema, assetSchema, createStepSchema } from '@freemarket/core'

export const curveTriCrypto2SwapSchema = createStepSchema('curve-tricrypto2-swap').extend({
  inputAsset: assetAmountSchema,
  outputAsset: assetSchema,
})

export interface CurveTriCrypto2Swap extends z.infer<typeof curveTriCrypto2SwapSchema> {}
