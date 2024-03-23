import z from 'zod'

import {
  absoluteAmountSchema,
  amountSchema,
  assetReferenceSchema,
  createStepSchema,
  percentSchema,
  stepProperties,
  assetSourceSchema,
  createBranchStepSchema,
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

const tokenASchema = assetReferenceSchema.describe(stepProperties('Token A', 'One of the two input assets'))
const tokenBSchema = assetReferenceSchema.describe(stepProperties('Token B', 'One of the two input assets'))
const liquidityRangeLower = amountSchema
  .describe(stepProperties('Liquidity Range Lower', 'The lower bound of the liquidity range'))
  .optional()
const liquidityRangeUpper = amountSchema
  .describe(stepProperties('Liquidity Range Upper', 'The upper bound of the liquidity range'))
  .optional()

const addCreateCommon = {
  tokenA: tokenASchema,
  tokenASource: assetSourceSchema.describe(stepProperties('Token A Source', 'The source of Token A.' + assetSourceDescription)),
  tokenAAmount: amountSchema.describe(stepProperties('Token A Amount', 'The amount of Token A to provide')),
  tokenB: tokenBSchema,
  tokenBSource: assetSourceSchema.describe(stepProperties('Token B Source', 'The source of Token B.' + assetSourceDescription)),
  tokenBAmount: amountSchema.describe(stepProperties('Token B Amount', 'The amount of Token B to provide')),
  liquidityRangeLower,
  liquidityRangeUpper,
}

export const uniswapMintPositionSchema = createStepSchema('uniswap-mint-position').extend(addCreateCommon)

export const uniswapAddLiquiditySchema = createStepSchema('uniswap-add-liquidity').extend({
  ...addCreateCommon,
  positionId: z.string().describe(stepProperties('Position ID', 'The ID of the position to mint')).optional(),
})

export const uniswapPositionExists = createBranchStepSchema('uniswap-position-exists').extend({
  tokenA: tokenASchema,
  tokenB: tokenBSchema,
  liquidityRangeLower,
  liquidityRangeUpper,
})
