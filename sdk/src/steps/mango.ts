import { getTokenAsset, getAccountAsset } from '../assetInfo'
import { MoneyAmount, WorkflowStep, WorkflowStepInfo } from '../types'

export type MangoTokenSymbol = 'SOL' | 'USDC'

export class MangoSwapStep extends WorkflowStep {
  constructor(init: MangoSwapStep) {
    super(init)
    Object.assign(this, init)
  }

  // todo
}

const MANGO_EXCHANGE_NAME = 'mangno'

const MANGO_DEPOSIT_INFO: WorkflowStepInfo = {
  stepId: 'mango.deposit',
  name: 'Mango Decentralized Exchange',
  blockchains: ['Ethereum'],
  gasEstimate: BigInt(400_000),
  exchangeFee: 0.01,
  description: 'Automated market maker for swapping SPL Tokens.',
}

const MANGO_WITHDRAWAL_INFO: WorkflowStepInfo = {
  stepId: 'mango.withdrawal',
  name: 'Mango Decentralized Exchange',
  blockchains: ['Ethereum'],
  gasEstimate: BigInt(400_000),
  exchangeFee: 0.01,
  description: 'Automated market maker for swapping SPL Tokens.',
}

interface MangoBuilderArg {
  symbol: MangoTokenSymbol
  amount: MoneyAmount
}

export function mangoDeposit(arg: MangoBuilderArg): WorkflowStep {
  return new MangoSwapStep({
    stepId: 'mango.deposit',
    inputAmount: arg.amount,
    inputAsset: getTokenAsset('Solana', arg.symbol),
    outputAsset: getAccountAsset('Solana', MANGO_EXCHANGE_NAME, arg.symbol),
    info: MANGO_DEPOSIT_INFO,
  })
}

export function mangoWithdrawal(arg: MangoBuilderArg): WorkflowStep {
  return new MangoSwapStep({
    stepId: 'mango.withdrawal',
    inputAmount: arg.amount,
    inputAsset: getAccountAsset('Solana', MANGO_EXCHANGE_NAME, arg.symbol),
    outputAsset: getTokenAsset('Solana', arg.symbol),
    info: MANGO_WITHDRAWAL_INFO,
  })
}
