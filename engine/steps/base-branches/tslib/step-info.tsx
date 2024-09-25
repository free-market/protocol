import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import ChainBranchIcon from './ChainBranchIcon'
import AssetBalanceBranchIcon from './AssetBalanceBranchIcon'
import ConvexStakeIcon from './branding-assets/ConvexIcon'
import GelatoIcon from './branding-assets/GelatoIcon'
import ChainBranchSummary from './ChainBranchSummary'
import AssetBalanceBranchSummary from './AssetBalanceBranchSummary'
import { STEP_TYPE_ID_CHAIN_BRANCH } from '@freemarket/core/tslib/step-ids'
import { STEP_TYPE_ID_ASSET_BALANCE_BRANCH } from '@freemarket/core/tslib/step-ids'
import { STEP_TYPE_ID_PREV_OUTPUT_BRANCH } from '@freemarket/core/tslib/step-ids'
import PreviousOutputBranchSummary from './PreviousOutputBranchSummary'

export const chainBranchPlatformInfo: PlatformInfo = {
  name: 'Chain Branch',
  description: 'Branches based on the current chain',
  icon: ChainBranchIcon,
  categories: ['Utilities'],
  stepInfos: [
    {
      stepType: 'chain-branch',
      stepTypeId: STEP_TYPE_ID_CHAIN_BRANCH,
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
      stepTypeId: STEP_TYPE_ID_ASSET_BALANCE_BRANCH,
      nodeType: 'branchNode',
      name: 'Asset Balance Branch',
      description: 'Branches based on an asset balance comparison',
      icon: AssetBalanceBranchIcon,
      summary: AssetBalanceBranchSummary,
    },
  ],
}
export const previousOutputBranchPlatformInfo: PlatformInfo = {
  name: 'Previous Output Branch',
  description: 'Branches based on the amount output from the previous step',
  icon: AssetBalanceBranchIcon,
  categories: ['Utilities'],
  stepInfos: [
    {
      stepType: 'previous-output-branch',
      stepTypeId: STEP_TYPE_ID_PREV_OUTPUT_BRANCH,
      nodeType: 'branchNode',
      name: 'Previous Output Branch',
      description: 'Branches based on the amount output from the previous step',
      icon: AssetBalanceBranchIcon,
      summary: PreviousOutputBranchSummary,
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
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Pay Gelato Relay',
      description: 'Pay Gelato Relay for executing a transaction',
      icon: GelatoIcon,
      comingSoon: true,
    },
  ],
}
