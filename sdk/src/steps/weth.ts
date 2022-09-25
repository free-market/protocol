import { getTokenAsset } from '../assetInfo'
import { MoneyAmount, WorkflowStep, WorkflowStepInfo, WorkflowStepResult } from '../types'

interface WethStep extends WorkflowStep {
  // TODO
}

const WRAP_INFO: WorkflowStepInfo = {
  stepId: 'weth.wrap',
  name: 'Wrap Etherium',
  blockchains: ['Ethereum'],
  gasEstimate: '1',
  exchangeFee: '0',
  description: 'Convert native ETH to WETH tokens.',
}

const UNWRAP_INFO: WorkflowStepInfo = {
  stepId: 'weth.unwrap',
  name: 'Unwrap Etherium',
  blockchains: ['Ethereum'],
  gasEstimate: '1',
  exchangeFee: '0',
  description: 'Convert WETH tokens to native ETH.',
}

interface WethBuilderArg {
  amount: MoneyAmount
}

export function wethWrap(arg: WethBuilderArg) {
  const rv: WethStep = {
    stepId: 'weth.wrap',
    inputAmount: arg.amount,
    inputAsset: getTokenAsset('Ethereum', 'ETH'),
    outputAsset: getTokenAsset('Ethereum', 'WETH'),
    info: WRAP_INFO,
  }
  return rv
}

export function wethUnwrap(arg: WethBuilderArg) {
  const rv: WethStep = {
    stepId: 'weth.unwrap',
    inputAmount: arg.amount,
    inputAsset: getTokenAsset('Ethereum', 'WETH'),
    outputAsset: getTokenAsset('Ethereum', 'ETH'),
    info: UNWRAP_INFO,
  }
  return rv
}
