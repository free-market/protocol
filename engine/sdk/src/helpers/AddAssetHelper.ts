import { EvmWorkflowStep } from '@freemarket/evm'
import type { AddAsset } from '../model'
import WorkflowRunner from '../runner/WorkflowRunner'
import { AbstractStepHelper } from './AbstractStepHelper'

export class AddAssetHelper extends AbstractStepHelper<AddAsset> {
  // getEncodedWorkflowStep(chainType: 'evm', stepConfig: AddAsset, workflow: WorkflowRunner): EvmWorkflowStep {
  //   throw new Error('Method not implemented.')
  // }
}
