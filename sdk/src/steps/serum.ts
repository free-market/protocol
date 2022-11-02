import { ActionBuilderArg, WorkflowActionInput } from '../builder/WorkflowBuilder'
import { WorkflowStepCategory, WorkflowActionInfo, Asset } from '../types'

export type SerumTokenSymbol = 'USDCet' | 'USDC' | 'USDT' | 'USDTet'

export type SerumSwapStep = ActionBuilderArg

export const SERUM_SWAP_INFO: WorkflowActionInfo = {
  actionId: 'serum.swap',
  name: 'Serum Swap',
  chains: ['Ethereum'],
  gasEstimate: '1',
  exchangeFee: '1',
  category: WorkflowStepCategory.Swap,
  description: 'Automated market maker for swapping SPL Tokens on Solana.',
  iconUrl: 'https://assets.website-files.com/61382d4555f82a75dc677b6f/61ff21f9dcce3b42bfe4135c_serum%20NOF.png',
  webSiteUrl: 'https://portal.projectserum.com/',
}

interface SerumSwapBuilderArg extends ActionBuilderArg {
  from: SerumTokenSymbol
  to: SerumTokenSymbol
}

export function serumSwap(arg: SerumSwapBuilderArg): WorkflowActionInput {
  const rv: WorkflowActionInput = {
    id: arg.id,
    actionId: 'serum.swap',
    amount: arg.amount,
    inputAsset: new Asset('Solana', arg.from),
    outputAsset: new Asset('Solana', arg.to),
  }
  return rv
}
