import type z from 'zod'
import { amountSchema, createStepSchema, stepProperties } from '@freemarket/core'

export const wrapNativeSchema = createStepSchema('wrap-native').extend({
  amount: amountSchema.describe(stepProperties('Amount', 'The amount of native asset to wrap.')),
})

export interface WrapNative extends z.infer<typeof wrapNativeSchema> {}

export const unwrapNativeSchema = createStepSchema('unwrap-native').extend({
  amount: amountSchema.describe(stepProperties('Amount', 'The amount of wrapped native asset to unwrap.')),
})

export interface UnwrapNative extends z.infer<typeof unwrapNativeSchema> {}
