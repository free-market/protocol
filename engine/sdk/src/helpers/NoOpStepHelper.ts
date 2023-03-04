import { IStepHelper } from '../IStepHelper'
import { AssetAmount, Workflow } from '../model'

export class NoopStepHelper implements IStepHelper<any> {
  getRequiredAssets(_stepConfig: any, _workflow: Workflow): Promise<AssetAmount[]> {
    return Promise.resolve([])
  }
}
