import { ActionBuilderArg, StepBuilderArg, WorkflowActionInput } from '../builder/WorkflowBuilder'
import { WorkflowStepCategory, WorkflowActionInfo, Asset } from '../types'

export type MangoTokenSymbol = 'SOL' | 'USDC'

// TODO need to maintain a list of supported tokens

export const MANGO_DEPOSIT_INFO: WorkflowActionInfo = {
  actionId: 'mango.deposit',
  name: 'Mango Deposit',
  chains: ['Ethereum'],
  gasEstimate: '4',
  exchangeFee: '1',
  category: WorkflowStepCategory.Yield,
  description: 'Automated market maker for swapping SPL Tokens.',
  iconUrl: 'https://v2.mango.markets/assets/icons/logo.svg',
  webSiteUrl: 'https://mango.markets/',
}

export const MANGO_WITHDRAWAL_INFO: WorkflowActionInfo = {
  actionId: 'mango.withdrawal',
  name: 'Mango Withdrawal',
  chains: ['Ethereum'],
  gasEstimate: '4',
  exchangeFee: '1',
  category: WorkflowStepCategory.Yield,
  description: 'Automated market maker for swapping SPL Tokens.',
  iconUrl: 'https://v2.mango.markets/assets/icons/logo.svg',
  webSiteUrl: 'https://mango.markets/',
}

export interface MangoBuilderArg extends ActionBuilderArg {
  symbol: string
}

function toMangoAsset(symbol: string) {
  return new Asset('Solana', symbol)
}

export function mangoDeposit(arg: MangoBuilderArg): WorkflowActionInput {
  const rv: WorkflowActionInput = {
    id: arg.id,
    actionId: 'mango.deposit',
    amount: arg.amount,
    inputAsset: toMangoAsset(arg.symbol),
    outputAsset: toMangoAsset(arg.symbol + 'man'),
  }
  return rv
}

export function mangoWithdrawal(arg: MangoBuilderArg): StepBuilderArg {
  const rv: WorkflowActionInput = {
    id: arg.id,
    actionId: 'mango.withdrawal',
    amount: arg.amount,
    inputAsset: toMangoAsset(arg.symbol + 'man'),
    outputAsset: toMangoAsset(arg.symbol),
  }
  return rv
}
