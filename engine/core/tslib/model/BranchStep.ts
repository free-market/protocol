import type z from 'zod'
import { nonEmptyStringSchema } from './NonEmptyString'
import { createStepSchema, stepBaseSchema } from './StepBase'

export const branchStepSchema = stepBaseSchema.extend({
  ifYes: nonEmptyStringSchema.optional(),
})

export interface BranchStep extends z.infer<typeof branchStepSchema> {}

export function createBranchStepSchema<T extends string>(type: T) {
  return createStepSchema(type).extend({
    ifYes: nonEmptyStringSchema.optional(),
  })
}
