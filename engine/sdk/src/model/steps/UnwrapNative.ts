import type z from 'zod'
import { amountSchema } from '../Amount'
import { createStepSchema } from '../StepBase'

export const unwrapNativeSchema = createStepSchema('unwrap-native').extend({
  amount: amountSchema,
})

export interface UnwrapNative extends z.infer<typeof unwrapNativeSchema> {}
