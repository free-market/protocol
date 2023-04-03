import z from 'zod'

import {
  absoluteAmountSchema,
  amountSchema,
  createStepSchema,
  decimalStringSchema,
  nonEmptyStringSchema,
  percentAmountSchema,
} from '@freemarket/core'

export const uniswapFeeTierSchema = z.union([z.literal('lowest'), z.literal('low'), z.literal('medium'), z.literal('high')])
export type UniswapFeeTier = z.infer<typeof uniswapFeeTierSchema>

const baseAttributes = {
  inputSymbol: nonEmptyStringSchema,
  outputSymbol: nonEmptyStringSchema,
  slippageTolerance: percentAmountSchema.optional(),
  amountEstimate: decimalStringSchema.optional(),
}

export const uniswapExactInSchema = createStepSchema('uniswap-exact-in').extend({
  ...baseAttributes,
  inputAmount: absoluteAmountSchema,
})

export interface UniswapExactIn extends z.infer<typeof uniswapExactInSchema> {}

export const uniswapExactOutSchema = createStepSchema('uniswap-exact-out').extend({
  ...baseAttributes,
  outputAmount: amountSchema,
})

export interface UniswapExactOut extends z.infer<typeof uniswapExactOutSchema> {}
