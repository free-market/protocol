import z from 'zod'
import { amountSchema, createStepSchema, nonEmptyStringSchema } from '@freemarket/core'

export const uniswapExactInSchema = createStepSchema('uniswap-exact-in').extend({
  inputSymbol: nonEmptyStringSchema,
  outputSymbol: nonEmptyStringSchema,
  inputAmount: amountSchema,
})

export interface UniswapExactIn extends z.infer<typeof uniswapExactInSchema> {}

export const uniswapExactOutSchema = createStepSchema('uniswap-exact-out').extend({
  inputSymbol: nonEmptyStringSchema,
  outputSymbol: nonEmptyStringSchema,
  outputAmount: amountSchema,
})

export interface UniswapExactOut extends z.infer<typeof uniswapExactOutSchema> {}
