import { EvmWorkflowStep } from '@freemarket/evm'
import type { AddAsset } from '../model'
import { IWorkflowRunner } from '../runner/IWorkflowRunner'
import { AbstractStepHelper } from './AbstractStepHelper'

export class AddAssetHelper extends AbstractStepHelper<AddAsset> {
  // getEncodedWorkflowStep(chainType: 'evm', stepConfig: AddAsset, workflow: WorkflowRunner): EvmWorkflowStep {
  //   throw new Error('Method not implemented.')
  // }
}
