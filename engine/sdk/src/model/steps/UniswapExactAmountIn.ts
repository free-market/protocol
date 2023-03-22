import z from 'zod'
import { amountSchema, nonEmptyStringSchema, createStepSchema } from '@freemarket/core'

export const uniswapExactInSchema = createStepSchema('uniswap-exact-in').extend({
  inputAsset: nonEmptyStringSchema,
  outputAsset: nonEmptyStringSchema,
  amountIn: amountSchema,
  maxSlippagePercent: z.number().gt(0).lt(100),
})

export interface UniswapExactIn extends z.infer<typeof uniswapExactInSchema> {}
