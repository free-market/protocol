import type z from 'zod'
import { createBranchStepSchema } from '../BranchStep'
import { chainSchema } from '../Chain'

export const chainBranchSchema = createBranchStepSchema('chain-branch').extend({
  currentChain: chainSchema,
})

export interface ChainBranch extends z.infer<typeof chainBranchSchema> {}
