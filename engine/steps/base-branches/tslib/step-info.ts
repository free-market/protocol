import { StepInfo } from '@freemarket/step-sdk'
import ChainBranchIcon from './ChainBranchIcon'
import AssetBalanceBranchIcon from './AssetBalanceBranchIcon'

export const chainBranchStepInfo: StepInfo = {
  stepType: 'chain-branch',
  nodeType: 'branchNode',
  name: 'Chain Branch',
  description: 'Branches based on the current chain',
  platform: 'None',
  categories: ['Utilities'],
  icon: ChainBranchIcon,
}

export const assetBalanceBranchStepInfo: StepInfo = {
  stepType: 'asset-balance-branch',
  nodeType: 'branchNode',
  name: 'Asset Balance Branch',
  description: 'Branches based on an asset balance comparison',
  platform: 'None',
  categories: ['Utilities'],
  icon: AssetBalanceBranchIcon,
}
