import type z from 'zod'
import { amountSchema, createStepSchema } from '@freemarket/core'

export const unwrapNativeSchema = createStepSchema('unwrap-native').extend({
  amount: amountSchema,
})

export interface UnwrapNative extends z.infer<typeof unwrapNativeSchema> {}
