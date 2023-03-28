import z from 'zod'
import { amountSchema, assetReferenceSchema, createStepSchema } from '@freemarket/core'

const triCrypto2Symbol = z.enum(['USDT', 'WETH', 'WBTC'])

export const curveTriCrypto2SwapSchema = createStepSchema('curve-tricrypto2-swap').extend({
  inputAsset: assetReferenceSchema,
  inputAmount: amountSchema,
  outputAsset: assetReferenceSchema,
})

export interface CurveTriCrypto2Swap extends z.infer<typeof curveTriCrypto2SwapSchema> {}
