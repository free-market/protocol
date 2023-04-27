import z from 'zod'

import { absoluteAmountSchema, amountSchema, assetReferenceSchema, createStepSchema, percentSchema, stepProperties } from '@freemarket/core'

export const uniswapFeeTierSchema = z.union([z.literal('lowest'), z.literal('low'), z.literal('medium'), z.literal('high')])
export type UniswapFeeTier = z.infer<typeof uniswapFeeTierSchema>

const baseAttributes = {
  inputAsset: assetReferenceSchema.describe(stepProperties('Input Asset', 'The input asset')),
  outputAsset: assetReferenceSchema.describe(stepProperties('Output Symbol', 'The output asset')),
  slippageTolerance: percentSchema.optional().describe(stepProperties('Slippage Tolerance', 'The maximum amount of slippage to allow')),
  // amountEstimate: decimalStringSchema
  //   .optional()
  //   .describe(stepProperties('Amount Estimate', 'The estimated amount of output asset to receive')),
}

export const uniswapExactInSchema = createStepSchema('uniswap-exact-in').extend({
  inputAmount: amountSchema.describe(stepProperties('Input Amount', 'The amount of input asset to swap')),
  ...baseAttributes,
})

export interface UniswapExactIn extends z.infer<typeof uniswapExactInSchema> {}

export const uniswapExactOutSchema = createStepSchema('uniswap-exact-out').extend({
  outputAmount: absoluteAmountSchema.describe(stepProperties('Output Amount', 'The amount of output to receive from the swap')),
  ...baseAttributes,
})

export interface UniswapExactOut extends z.infer<typeof uniswapExactOutSchema> {}
