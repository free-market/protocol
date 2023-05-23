import type z from 'zod'
import { amountSchema, assetSourceSchema, createStepSchema, stepProperties } from '@freemarket/core'

export const wrapNativeSchema = createStepSchema('wrap-native').extend({
  amount: amountSchema.describe(stepProperties('Amount', 'The amount of native asset to wrap.')),
  source: assetSourceSchema.describe(stepProperties('Source', 'The source of the native asset.')),
})

export interface WrapNative extends z.infer<typeof wrapNativeSchema> {}

export const unwrapNativeSchema = createStepSchema('unwrap-native').extend({
  amount: amountSchema.describe(stepProperties('Amount', 'The amount of wrapped native asset to unwrap.')),
  source: assetSourceSchema.describe(stepProperties('Source', 'The source of the wrapped native asset.')),
})

export interface UnwrapNative extends z.infer<typeof unwrapNativeSchema> {}
