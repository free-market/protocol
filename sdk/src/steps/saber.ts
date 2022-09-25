import { getTokenAsset } from '../assetInfo'
import { MoneyAmount, WorkflowStep, WorkflowStepInfo } from '../types'

export type SaberTokenSymbol = 'USDCet' | 'USDC' | 'USDT' | 'USDTet'

export interface SaberSwapStep extends WorkflowStep {
  // todo
}

const SABER_INFO: WorkflowStepInfo = {
  stepId: 'saber.swap',
  name: 'Saber AMM',
  blockchains: ['Ethereum'],
  gasEstimate: '1',
  exchangeFee: '1',
  description: 'Automated market maker for swapping SPL Tokens.',
}

interface SaberSwapBuilderArg {
  from: SaberTokenSymbol
  to: SaberTokenSymbol
  amount: MoneyAmount
}

export function saberSwap(arg: SaberSwapBuilderArg): WorkflowStep {
  const rv: SaberSwapStep = {
    stepId: 'saber.swap',
    inputAmount: arg.amount,
    inputAsset: getTokenAsset('Solana', arg.from),
    outputAsset: getTokenAsset('Solana', arg.to),
    info: SABER_INFO,
  }
  return rv
}
