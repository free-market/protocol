import type z from 'zod'
import { amountSchema, createStepSchema } from '@freemarket/core'

export const wrapNativeSchema = createStepSchema('wrap-native').extend({
  amount: amountSchema,
})

export interface WrapNative extends z.infer<typeof wrapNativeSchema> {}
