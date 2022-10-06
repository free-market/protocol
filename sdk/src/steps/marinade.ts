import { getTokenAsset } from '../assetInfo'
import { MoneyAmount, WorkflowStep, WorkflowStepInfo } from '../types'

export type SerumTokenSymbol = 'USDCet' | 'USDC' | 'USDT' | 'USDTet'

export type SerumSwapStep = WorkflowStep

const MARINADE_INFO: WorkflowStepInfo = {
  stepId: 'marinade.stake',
  name: 'Marinade Stake',
  blockchains: ['Ethereum'],
  gasEstimate: '1',
  exchangeFee: '1',
  description: 'Non-custodial liquid staking protocol for the Solana blockchain',
  iconUrl: 'https://raw.githubusercontent.com/marinade-finance/liquid-staking-program/main/Docs/img/MNDE.png',
  webSiteUrl: 'https://marinade.finance/',
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
    info: MARINADE_INFO,
  }
  return rv
}
export function marinadeUnstake(arg?: MarinadeStepArg): WorkflowStep {
  const rv: SerumSwapStep = {
    stepId: 'marinade.unstake',
    inputAmount: (arg && arg.amount) || '100%',
    inputAsset: getTokenAsset('Solana', 'mSOL'),
    outputAsset: getTokenAsset('Solana', 'SOL'),
    info: {
      ...MARINADE_INFO,
      stepId: 'marinade.unstake',
      name: 'Marinade Unstake',
    },
  }
  return rv
}
