import z from 'zod'
import { amountSchema } from '../Amount'
import { nonEmptyStringSchema } from '../NonEmptyString'
import { createStepSchema } from '../StepBase'

export const uniswapExactInSchema = createStepSchema('uniswap-exact-in').extend({
  inputAsset: nonEmptyStringSchema,
  outputAsset: nonEmptyStringSchema,
  amountIn: amountSchema,
  maxSlippagePercent: z.number().gt(0).lt(100),
})

export interface UniswapExactIn extends z.infer<typeof uniswapExactInSchema> {}
