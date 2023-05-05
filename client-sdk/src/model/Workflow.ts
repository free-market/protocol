import z from 'zod'
import { fungibleTokenSchema, parameterSchema, positionSchema } from '@freemarket/core'
import { stepSchema } from './Step'

export const workflowSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    parameters: parameterSchema.array().optional(),
    fungibleTokens: fungibleTokenSchema
      .array()
      .optional()
      .describe(
        'Custom fungible tokens used in this workflow.  These override or augment the default curated set of tokens provided by the SDK.'
      ),
    steps: stepSchema.array().describe('The set of steps for this workflow.  Execution will begin at the step at index 0.'),
    startStepId: z.string().optional().describe('The id of the step to start at.  Defaults to the first step in the workflow.'),
    startNodePosition: positionSchema.optional(),
  })
  .describe('A workflow.')

export interface Workflow extends z.infer<typeof workflowSchema> {}
