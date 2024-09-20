import z from 'zod'

import {
  absoluteAmountSchema,
  amountSchema,
  assetReferenceSchema,
  createStepSchema,
  percentSchema,
  stepProperties,
  assetSourceSchema,
  addressSchema,
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

export const uniswapAddLiquiditySchema = createStepSchema('uniswap-add-liquidity').extend({
  inputAsset0 : inputAsset,
  inputAsset1: inputAsset,
  tickLower: z.number().optional().describe(stepProperties('Tick Lower', 'TL')),
  tickUpper: z.number().optional().describe(stepProperties('Tick Upper', 'TU')),
  amount0Desired: absoluteAmountSchema.describe(stepProperties('InputAsset0', 'Desired input amount of token0')),
  amount1Desired: absoluteAmountSchema.describe(stepProperties('InputAsset1', 'Desired input amount of token1')),
  amount0Min: absoluteAmountSchema.describe(stepProperties('amount0Min', 'Min amount of token0')),
  amount1Min: absoluteAmountSchema.describe(stepProperties('amount0Min', 'Min amount of token1')),
  deadline: z.date(),
  inputAssetSource
})

export interface UniswapAddLiquidity extends z.infer<typeof uniswapAddLiquiditySchema> {}

/*
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }
*/
