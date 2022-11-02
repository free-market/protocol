import { BigNumber } from 'ethers'
import { WorkflowEventType } from '../engine'
import { AssetAmount, WorkflowStep, WorkflowStepResult } from '../types'
import { AssetBalances } from './AssetBalances'

export type StatusCallback = (type: WorkflowEventType, statusUpdate: string, steps: WorkflowStep[]) => void

export interface StepImpl {
  actualizeAmount(step: WorkflowStep, assetBalances: AssetBalances): Promise<[BigNumber, boolean]>
  executeAction(step: WorkflowStep, amount: BigNumber, statusCallback: StatusCallback): Promise<WorkflowStepResult>
  // updateBalances(
  //   step: WorkflowStep,
  //   stepResult: WorkflowStepResult,
  //   assetBalances: AssetBalances,
  //   inputAmount: BigNumber,
  //   isAbsoluteInputAmount: boolean
  // ): void
}
