import { AssetAmount, Chain, Workflow } from './model'

export interface IStepHelper<T> {
  getRequiredAssets(stepConfig: T, workflow: Workflow): Promise<AssetAmount[]>
  getBridgeDestinationChain(stepConfig: T): Chain | null
  getEncodedWorkflowStep(stepConfig: T, workflow: Workflow): Promise<AssetAmount[]>
}
