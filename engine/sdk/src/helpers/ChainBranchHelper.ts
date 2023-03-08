import { EvmWorkflowStep } from '@freemarket/evm'
import type { ChainBranch } from '../model'
import { IWorkflowRunner } from '../runner/IWorkflowRunner'
import { AbstractBranchHelper } from './AbstractBranchHelper'

export class ChainBranchHelper extends AbstractBranchHelper<ChainBranch> {
  // getEncodedWorkflowStep(_chainType: 'evm', _stepConfig: ChainBranch, _workflow: WorkflowRunner): EvmWorkflowStep {
  //   throw new Error('Method not implemented.')
  // }
}
