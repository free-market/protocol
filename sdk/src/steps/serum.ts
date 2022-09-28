import { getTokenAsset } from '../assetInfo'
import { MoneyAmount, WorkflowStep, WorkflowStepInfo } from '../types'

export type SerumTokenSymbol = 'USDCet' | 'USDC' | 'USDT' | 'USDTet'

export type SerumSwapStep = WorkflowStep

const SERUM_INFO: WorkflowStepInfo = {
  stepId: 'serum.swap',
  name: 'Serum AMM',
  blockchains: ['Ethereum'],
  gasEstimate: '1',
  exchangeFee: '1',
  description: 'Automated market maker for swapping SPL Tokens on Solana.',
  iconUrl: 'https://assets.website-files.com/61382d4555f82a75dc677b6f/61ff21f9dcce3b42bfe4135c_serum%20NOF.png',
  webSiteUrl: 'https://portal.projectserum.com/',
}

interface SerumSwapBuilderArg {
  from: SerumTokenSymbol
  to: SerumTokenSymbol
  amount: MoneyAmount
}

export function serumSwap(arg: SerumSwapBuilderArg): WorkflowStep {
  const rv: SerumSwapStep = {
    stepId: 'serum.swap',
    inputAmount: arg.amount,
    inputAsset: getTokenAsset('Solana', arg.from),
    outputAsset: getTokenAsset('Solana', arg.to),
    info: SERUM_INFO,
  }
  return rv
}
