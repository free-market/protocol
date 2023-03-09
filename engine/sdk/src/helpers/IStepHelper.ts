import type { EncodedWorkflowStep } from '../EncodedWorkflow'
import type { AssetAmount, Chain, StepBase, Workflow } from '../model'
import type { IWorkflowRunner } from '../runner/IWorkflowRunner'
// import WorkflowRunner from './runner/WorkflowRunner'

export interface BridgeTarget {
  chain: Chain
  firstStepId: string
}

export interface NextSteps {
  sameChain: string[]
  differentChains?: [
    {
      chain: Chain
      stepId: string
    }
  ]
}

export interface IStepHelper<T extends StepBase> {
  getRequiredAssets(stepConfig: T, workflow: Workflow): Promise<AssetAmount[]>
  getBridgeTarget(stepConfig: T): BridgeTarget | null
  getEncodedWorkflowStep(chain: Chain, stepConfig: T, runner: IWorkflowRunner): Promise<EncodedWorkflowStep>
  getPossibleNextSteps(stepConfig: T): NextSteps | null
}
