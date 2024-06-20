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
import { assetSourceDescription } from '@freemarket/step-sdk'

export const uniswapFeeTierSchema = z.union([z.literal('lowest'), z.literal('low'), z.literal('medium'), z.literal('high')])
export type UniswapFeeTier = z.infer<typeof uniswapFeeTierSchema>

const inputAsset = assetReferenceSchema.describe(stepProperties('Input Asset', 'The input asset'))
const outputAsset = assetReferenceSchema.describe(stepProperties('Output Symbol', 'The output asset'))
const slippageTolerance = percentSchema
  .optional()
  .describe(
    stepProperties(
      'Slippage Tolerance %',
      'The maximum amount of slippage to allow.  Slippage is deviation from the quoted swap rate to the actual swap rate.'
    )
  )

const inputAssetSource = assetSourceSchema.describe(
  stepProperties('Input Source', 'The source of the input asset.' + assetSourceDescription)
)

export const uniswapExactInSchema = createStepSchema('uniswap-exact-in').extend({
  inputAsset,
  inputAssetSource,
  inputAmount: amountSchema.describe(stepProperties('Input Amount', 'The amount of input asset to swap')),
  outputAsset,
  slippageTolerance,
})

export interface UniswapExactIn extends z.infer<typeof uniswapExactInSchema> {}

export const uniswapExactOutSchema = createStepSchema('uniswap-exact-out').extend({
  inputAsset,
  outputAsset,
  outputAmount: absoluteAmountSchema.describe(stepProperties('Output Amount', 'The amount of output to receive from the swap')),
  slippageTolerance,
})

export interface UniswapExactOut extends z.infer<typeof uniswapExactOutSchema> {}
