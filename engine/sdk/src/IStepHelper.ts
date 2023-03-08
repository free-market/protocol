// import { ChainType, EncodedWorkflowStep } from './EncodedWorkflow'
import { AssetAmount, Chain, StepBase, Workflow } from './model'
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
  // getEncodedWorkflowStep(chainType: ChainType, stepConfig: T, runner: WorkflowRunner): EncodedWorkflowStep
  getPossibleNextSteps(stepConfig: T): NextSteps | null
}
