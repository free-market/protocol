import z from 'zod'
import { EvmWorkflowStep } from '@freemarket/evm'
import { AaveSupply, AaveWithdrawal, StargateBridge, UniswapExactIn } from '../model'
import WorkflowRunner from '../runner/WorkflowRunner'
import { AbstractStepHelper } from './AbstractStepHelper'

export class AaveSupplyHelper extends AbstractStepHelper<StargateBridge> {
  // getEncodedWorkflowStep(chainType: 'evm', stepConfig: StargateBridge, workflow: WorkflowRunner): EvmWorkflowStep {
  //   throw new Error('Method not implemented.')
  // }
}
