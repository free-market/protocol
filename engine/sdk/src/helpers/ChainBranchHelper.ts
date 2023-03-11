import type { EncodedWorkflowStep } from '../EncodedWorkflow'
import type { ChainBranch } from '../model'
import { AbstractBranchHelper } from './AbstractBranchHelper'
import type { EncodingContext } from './IStepHelper'

export class ChainBranchHelper extends AbstractBranchHelper<ChainBranch> {
  encodeWorkflowStep(_context: EncodingContext<ChainBranch>): Promise<EncodedWorkflowStep> {
    throw new Error('Method not implemented.')
  }
}
