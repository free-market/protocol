import type z from 'zod'
import { amountSchema } from '../Amount'
import { createStepSchema } from '../StepBase'

export const wrapNativeSchema = createStepSchema('wrap-native').extend({
  amount: amountSchema,
})

export interface WrapNative extends z.infer<typeof wrapNativeSchema> {}
