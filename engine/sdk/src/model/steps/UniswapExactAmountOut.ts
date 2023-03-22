import z from 'zod'
import { absoluteAmountSchema, nonEmptyStringSchema, createStepSchema } from '@freemarket/core'

export const uniswapExactOutSchema = createStepSchema('uniswap-exact-out').extend({
  inputAsset: nonEmptyStringSchema,
  outputAsset: nonEmptyStringSchema,
  amountOut: absoluteAmountSchema,
  maxSlippagePercent: z.number().gt(0).lt(100),
})

export interface UniswapExactOut extends z.infer<typeof uniswapExactOutSchema> {}
