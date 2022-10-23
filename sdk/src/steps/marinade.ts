import { getTokenAsset } from '../assetInfo'
import { MoneyAmount, WorkflowStep, WorkflowStepCategory, WorkflowStepInfo } from '../types'

export type SerumTokenSymbol = 'USDCet' | 'USDC' | 'USDT' | 'USDTet'

export type SerumSwapStep = WorkflowStep

export const MARINADE_STAKE_INFO: WorkflowStepInfo = {
  stepId: 'marinade.stake',
  name: 'Marinade Stake',
  blockchains: ['Ethereum'],
  gasEstimate: '1',
  exchangeFee: '1',
  category: WorkflowStepCategory.Invest,
  description: 'Non-custodial liquid staking protocol for the Solana blockchain',
  iconUrl: 'https://raw.githubusercontent.com/marinade-finance/liquid-staking-program/main/Docs/img/MNDE.png',
  webSiteUrl: 'https://marinade.finance/',
}

export const MARINADE_UNSTAKE_INFO: WorkflowStepInfo = {
  ...MARINADE_STAKE_INFO,
  stepId: 'marinade.unstake',
  name: 'Marinade Unstake',
}

interface MarinadeStepArg {
  amount?: MoneyAmount
}

export function marinadeStake(arg?: MarinadeStepArg): WorkflowStep {
  const rv: SerumSwapStep = {
    stepId: 'marinade.stake',
    inputAmount: (arg && arg.amount) || '100%',
    inputAsset: getTokenAsset('Solana', 'SOL'),
    outputAsset: getTokenAsset('Solana', 'mSOL'),
    info: MARINADE_STAKE_INFO,
  }
  return rv
}
export function marinadeUnstake(arg?: MarinadeStepArg): WorkflowStep {
  const rv: SerumSwapStep = {
    stepId: 'marinade.unstake',
    inputAmount: (arg && arg.amount) || '100%',
    inputAsset: getTokenAsset('Solana', 'mSOL'),
    outputAsset: getTokenAsset('Solana', 'SOL'),
    info: MARINADE_UNSTAKE_INFO,
  }
  return rv
}
