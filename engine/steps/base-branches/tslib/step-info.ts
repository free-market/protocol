import { StepInfo } from '@freemarket/step-sdk'
import ChainBranchIcon from './ChainBranchIcon'
import AssetBalanceBranchIcon from './AssetBalanceBranchIcon'
import ConvexStakeIcon from './branding-assets/ConvexIcon'
import GelatoIcon from './branding-assets/GelatoIcon'
import ChainBranchSummary from './ChainBranchSummary'
import AssetBalanceBranchSummary from './AssetBalanceBranchSummary'
export const chainBranchStepInfo: StepInfo = {
  stepType: 'chain-branch',
  nodeType: 'branchNode',
  name: 'Chain Branch',
  description: 'Branches based on the current chain',
  categories: ['Utilities'],
  icon: ChainBranchIcon,
  summary: ChainBranchSummary,
}

export const assetBalanceBranchStepInfo: StepInfo = {
  stepType: 'asset-balance-branch',
  nodeType: 'branchNode',
  name: 'Asset Balance Branch',
  description: 'Branches based on an asset balance comparison',
  categories: ['Utilities'],
  icon: AssetBalanceBranchIcon,
  summary: AssetBalanceBranchSummary,
}

export const stepInfos: StepInfo[] = [
  chainBranchStepInfo,
  assetBalanceBranchStepInfo,
  {
    stepType: 'convex-stake',
    nodeType: 'stepNode',
    name: 'Convex Stake',
    description: 'Earn additional yield from CRV tokens',
    platform: 'Convex',
    categories: ['Yield'],
    icon: ConvexStakeIcon,
    comingSoon: true,
  },
  {
    stepType: 'gelato-relay-pay',
    nodeType: 'stepNode',
    name: 'Pay Gelato Relay',
    description: 'Pay Gelato Relay for executing a transaction',
    platform: 'Gelato',
    categories: ['Utilities'],
    icon: GelatoIcon,
    comingSoon: true,
  },
]
