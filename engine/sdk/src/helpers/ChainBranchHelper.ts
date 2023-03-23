import type { ChainBranch } from '../model'
import { EncodedWorkflowStep, EncodingContext } from '@freemarket/core'
import { AbstractBranchHelper } from '@freemarket/step-sdk'
export class ChainBranchHelper extends AbstractBranchHelper<ChainBranch> {
  encodeWorkflowStep(_context: EncodingContext<ChainBranch>): Promise<EncodedWorkflowStep> {
    throw new Error('Method not implemented.')
  }
}
