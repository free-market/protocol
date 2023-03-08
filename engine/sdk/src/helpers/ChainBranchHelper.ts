import { EvmWorkflowStep } from '@freemarket/evm'
import { ChainBranch } from '../model'
import WorkflowRunner from '../runner/WorkflowRunner'
import { AbstractBranchHelper } from './AbstractBranchHelper'

export class ChainBranchHelper extends AbstractBranchHelper<ChainBranch> {
  // getEncodedWorkflowStep(_chainType: 'evm', _stepConfig: ChainBranch, _workflow: WorkflowRunner): EvmWorkflowStep {
  //   throw new Error('Method not implemented.')
  // }
}
