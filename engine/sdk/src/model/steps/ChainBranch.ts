import type z from 'zod'
import { createBranchStepSchema, chainSchema } from '@freemarket/core'

export const chainBranchSchema = createBranchStepSchema('chain-branch').extend({
  currentChain: chainSchema,
})

export interface ChainBranch extends z.infer<typeof chainBranchSchema> {}
