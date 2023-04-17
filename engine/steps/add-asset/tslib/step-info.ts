import { StepInfo } from '@freemarket/step-sdk'
import AddAssetIcon from './AddAssetIcon'

export const stepInfo: StepInfo = {
  stepType: 'add-asset',
  nodeType: 'stepNode',
  name: 'Add Asset',
  description: 'Adds an asset to the workflow',
  platform: 'No Platform',
  categories: ['Utilities'],
  icon: AddAssetIcon,
}
