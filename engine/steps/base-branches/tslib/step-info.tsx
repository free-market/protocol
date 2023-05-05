import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import ChainBranchIcon from './ChainBranchIcon'
import AssetBalanceBranchIcon from './AssetBalanceBranchIcon'
import ConvexStakeIcon from './branding-assets/ConvexIcon'
import GelatoIcon from './branding-assets/GelatoIcon'
import ChainBranchSummary from './ChainBranchSummary'
import AssetBalanceBranchSummary from './AssetBalanceBranchSummary'

export const chainBranchPlatformInfo: PlatformInfo = {
  name: 'Chain Branch',
  description: 'Branches based on the current chain',
  icon: ChainBranchIcon,
  categories: ['Utilities'],
  stepInfos: [
    {
      stepType: 'chain-branch',
      nodeType: 'branchNode',
      name: 'Chain Branch',
      description: 'Branches based on the current chain',
      icon: ChainBranchIcon,
      summary: ChainBranchSummary,
    },
  ],
}

export const assetBalanceBranchPlatformInfo: PlatformInfo = {
  name: 'Asset Balance Branch',
  description: 'Branches based on an asset balance comparison',
  icon: AssetBalanceBranchIcon,
  categories: ['Utilities'],
  stepInfos: [
    {
      stepType: 'asset-balance-branch',
      nodeType: 'branchNode',
      name: 'Asset Balance Branch',
      description: 'Branches based on an asset balance comparison',
      icon: AssetBalanceBranchIcon,
      summary: AssetBalanceBranchSummary,
    },
  ],
}

export const payGelatoRelayPlatform: PlatformInfo = {
  name: 'Pay Gelato Relay',
  description: 'Pay Gelato Relay for executing a transaction',
  icon: GelatoIcon,
  categories: ['Utilities'],
  stepInfos: [
    {
      stepType: 'gelato-relay-pay',
      nodeType: 'stepNode',
      name: 'Pay Gelato Relay',
      description: 'Pay Gelato Relay for executing a transaction',
      icon: GelatoIcon,
      comingSoon: true,
    },
  ],
}
