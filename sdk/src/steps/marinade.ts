import { ActionBuilderArg, WorkflowActionInput } from '../builder/WorkflowBuilder'
import { WorkflowStepCategory, WorkflowActionInfo, Asset } from '../types'

export type SerumTokenSymbol = 'USDCet' | 'USDC' | 'USDT' | 'USDTet'

export type SerumSwapStep = ActionBuilderArg

export const MARINADE_STAKE_INFO: WorkflowActionInfo = {
  actionId: 'marinade.stake',
  name: 'Marinade Stake',
  chains: ['Ethereum'],
  gasEstimate: '1',
  exchangeFee: '1',
  category: WorkflowStepCategory.Yield,
  description: 'Non-custodial liquid staking protocol for the Solana blockchain',
  iconUrl: 'https://raw.githubusercontent.com/marinade-finance/liquid-staking-program/main/Docs/img/MNDE.png',
  webSiteUrl: 'https://marinade.finance/',
}

export const MARINADE_UNSTAKE_INFO: WorkflowActionInfo = {
  ...MARINADE_STAKE_INFO,
  actionId: 'marinade.unstake',
  name: 'Marinade Unstake',
}

export function marinadeStake(arg: ActionBuilderArg): WorkflowActionInput {
  const rv: WorkflowActionInput = {
    id: arg.id,
    actionId: 'marinade.stake',
    amount: arg.amount,
    inputAsset: new Asset('Solana', 'SOL'),
    outputAsset: new Asset('Solana', 'mSOL'),
  }
  return rv
}
export function marinadeUnstake(arg: ActionBuilderArg): WorkflowActionInput {
  const rv: WorkflowActionInput = {
    id: arg.id,
    actionId: 'marinade.unstake',
    amount: arg.amount,
    inputAsset: new Asset('Solana', 'mSOL'),
    outputAsset: new Asset('Solana', 'SOL'),
  }
  return rv
}
