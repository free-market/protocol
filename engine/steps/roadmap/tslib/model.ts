import z from 'zod'

import {
  absoluteAmountSchema,
  amountSchema,
  assetReferenceSchema,
  createStepSchema,
  percentSchema,
  stepProperties,
  assetSourceSchema,
  nonEmptyStringSchema,
} from '@freemarket/core'
import { assetSourceDescription } from '@freemarket/step-sdk'

export const oneInchFeeTierSchema = z.union([z.literal('lowest'), z.literal('low'), z.literal('medium'), z.literal('high')])
export type OneInchFeeTier = z.infer<typeof oneInchFeeTierSchema>

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

export const oneInchSchema = createStepSchema('oneInch').extend({
  inputAsset,
  inputAssetSource,
  inputAmount: amountSchema.describe(stepProperties('Amount', 'The amount of input asset to swap')),
  outputAsset,
  slippageTolerance,
})

export interface OneInch extends z.infer<typeof oneInchSchema> {}

export const telegramSendMessageSchema = createStepSchema('telegram-send').extend({
  to: nonEmptyStringSchema.describe(stepProperties('To', 'The destination to send the message to')),
  message: nonEmptyStringSchema.describe(stepProperties('Message', 'The message to send')),
})

export const stripeCryptoOnrampSchema = createStepSchema('stripe-crypto-onramp').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The crypto asset to purchase with fiat.')),
})

export const zeroExSchema = createStepSchema('zeroEx-swap').extend({
  inputAsset,
  inputAssetSource,
  inputAmount: amountSchema.describe(stepProperties('Amount', 'The amount of input asset to swap')),
  outputAsset,
  slippageTolerance,
})
