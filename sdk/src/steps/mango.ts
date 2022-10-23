import { getTokenAsset, getAccountAsset } from '../assetInfo'
import { MoneyAmount, WorkflowStep, WorkflowStepCategory, WorkflowStepInfo } from '../types'

export type MangoTokenSymbol = 'SOL' | 'USDC'

const MANGO_EXCHANGE_NAME = 'mangno'

export const MANGO_DEPOSIT_INFO: WorkflowStepInfo = {
  stepId: 'mango.deposit',
  name: 'Mango Deposit',
  blockchains: ['Ethereum'],
  gasEstimate: '4',
  exchangeFee: '1',
  category: WorkflowStepCategory.Invest,
  description: 'Automated market maker for swapping SPL Tokens.',
  iconUrl: 'https://v2.mango.markets/assets/icons/logo.svg',
  webSiteUrl: 'https://mango.markets/',
}

export const MANGO_WITHDRAWAL_INFO: WorkflowStepInfo = {
  stepId: 'mango.withdrawal',
  name: 'Mango Withdrawal',
  blockchains: ['Ethereum'],
  gasEstimate: '4',
  exchangeFee: '1',
  category: WorkflowStepCategory.Invest,
  description: 'Automated market maker for swapping SPL Tokens.',
  iconUrl: 'https://v2.mango.markets/assets/icons/logo.svg',
  webSiteUrl: 'https://mango.markets/',
}

export interface MangoBuilderArg {
  symbol: MangoTokenSymbol
  amount?: MoneyAmount
}

export function mangoDeposit(arg: MangoBuilderArg): WorkflowStep {
  const rv: WorkflowStep = {
    stepId: 'mango.deposit',
    inputAmount: arg.amount || '100%',
    inputAsset: getTokenAsset('Solana', arg.symbol),
    outputAsset: getTokenAsset('Solana', arg.symbol + 'man'),
    info: MANGO_DEPOSIT_INFO,
  }
  return rv
}

export function mangoWithdrawal(arg: MangoBuilderArg): WorkflowStep {
  const rv: WorkflowStep = {
    stepId: 'mango.withdrawal',
    inputAmount: arg.amount || '100%',
    inputAsset: getTokenAsset('Solana', arg.symbol + 'man'),
    outputAsset: getTokenAsset('Solana', arg.symbol),
    info: MANGO_WITHDRAWAL_INFO,
  }
  return rv
}
