import z from 'zod'

import {
  absoluteAmountSchema,
  amountSchema,
  assetReferenceSchema,
  createStepSchema,
  percentSchema,
  stepProperties,
  assetSourceSchema,
} from '@freemarket/core'

export const pulsexFeeTierSchema = z.union([z.literal('lowest'), z.literal('low'), z.literal('medium'), z.literal('high')])
export type PulsexFeeTier = z.infer<typeof pulsexFeeTierSchema>

const inputAsset = assetReferenceSchema.describe(stepProperties('Input Asset', 'The input asset'))
const outputAsset = assetReferenceSchema.describe(stepProperties('Output Symbol', 'The output asset'))
const slippageTolerance = percentSchema.optional().describe(stepProperties('Slippage Tolerance', 'The maximum amount of slippage to allow'))
const inputAssetSource = assetSourceSchema.describe(stepProperties('Input Source', 'The source of the input asset.'))

export const pulsexExactInSchema = createStepSchema('pulsex-exact-in').extend({
  inputAsset,
  inputAssetSource,
  inputAmount: amountSchema.describe(stepProperties('Input Amount', 'The amount of input asset to swap')),
  outputAsset,
  slippageTolerance,
})
// .refine(
//   data => {
//     return typeof data.inputAmount !== 'string' || !data.inputAmount.endsWith('%')
//   },
//   { message: 'Relative amounts are not supported' }
// )

export interface PulsexExactIn extends z.infer<typeof pulsexExactInSchema> {}

export const pulsexExactOutSchema = createStepSchema('pulsex-exact-out').extend({
  inputAsset,
  inputAssetSource,
  outputAsset,
  outputAmount: absoluteAmountSchema.describe(stepProperties('Output Amount', 'The amount of output to receive from the swap')),
  slippageTolerance,
})

export interface PulsexExactOut extends z.infer<typeof pulsexExactOutSchema> {}
