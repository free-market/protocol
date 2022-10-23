import { getTokenAsset } from '../assetInfo'
import { MoneyAmount, WorkflowStep, WorkflowStepCategory, WorkflowStepInfo, WorkflowStepResult } from '../types'

export const WETH_WRAP_INFO: WorkflowStepInfo = {
  stepId: 'weth.wrap',
  name: 'Wrap Ether',
  blockchains: ['Ethereum'],
  gasEstimate: '1',
  exchangeFee: '0',
  category: WorkflowStepCategory.Swap,
  description: 'Convert native ETH to WETH tokens.',
  iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png',
  webSiteUrl: 'https://weth.io/',
}

export const WETH_UNWRAP_INFO: WorkflowStepInfo = {
  stepId: 'weth.unwrap',
  name: 'Unwrap Ether',
  blockchains: ['Ethereum'],
  gasEstimate: '1',
  exchangeFee: '0',
  category: WorkflowStepCategory.Swap,
  description: 'Convert WETH tokens to native ETH.',
  iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png',
  webSiteUrl: 'https://weth.io/',
}

interface WethBuilderArg {
  amount: MoneyAmount
}

export function wethWrap(arg: WethBuilderArg) {
  const rv: WorkflowStep = {
    stepId: 'weth.wrap',
    inputAmount: arg.amount,
    inputAsset: getTokenAsset('Ethereum', 'ETH'),
    outputAsset: getTokenAsset('Ethereum', 'WETH'),
    info: WETH_WRAP_INFO,
  }
  return rv
}

export function wethUnwrap(arg: WethBuilderArg) {
  const rv: WorkflowStep = {
    stepId: 'weth.unwrap',
    inputAmount: arg.amount,
    inputAsset: getTokenAsset('Ethereum', 'WETH'),
    outputAsset: getTokenAsset('Ethereum', 'ETH'),
    info: WETH_UNWRAP_INFO,
  }
  return rv
}
