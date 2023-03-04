import { AssetAmount, Workflow } from './model'

export interface IStepHelper<T> {
  getRequiredAssets(stepConfig: T, workflow: Workflow): Promise<AssetAmount[]>
}
