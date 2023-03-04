import z from 'zod'

export const stepBaseSchema = z.object({
  stepId: z.string().min(1).optional().describe('The identifier for this step.'),
  nextStepId: z
    .string()
    .min(1)
    .regex(/^[^\s]*$/)
    .optional()
    .describe('The id of the next step in the workflow.  Defaults to the following step in the workflow.steps[] array.'),
})

export interface StepBase extends z.infer<typeof stepBaseSchema> {}

export function createStepSchema<T extends string>(type: T) {
  return stepBaseSchema.extend({
    type: z.literal(type).describe('The type for this step.'),
  })
}
