import { ActionBuilderArg, WorkflowActionInput } from '../builder/WorkflowBuilder'
import { AssetAmount, WorkflowStepCategory, WorkflowActionInfo, Asset } from '../types'

export const WETH_WRAP_INFO: WorkflowActionInfo = {
  actionId: 'weth.wrap',
  name: 'Wrap Ether',
  chains: ['Ethereum'],
  gasEstimate: '1',
  exchangeFee: '0',
  category: WorkflowStepCategory.Swap,
  description: 'Convert native ETH to WETH tokens.',
  iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png',
  webSiteUrl: 'https://weth.io/',
}

export const WETH_UNWRAP_INFO: WorkflowActionInfo = {
  actionId: 'weth.unwrap',
  name: 'Unwrap Ether',
  chains: ['Ethereum'],
  gasEstimate: '1',
  exchangeFee: '0',
  category: WorkflowStepCategory.Swap,
  description: 'Convert WETH tokens to native ETH.',
  iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png',
  webSiteUrl: 'https://weth.io/',
}

interface WethBuilderArg extends ActionBuilderArg {
  amount: AssetAmount
}

export function wethWrap(arg: WethBuilderArg) {
  const rv: WorkflowActionInput = {
    id: arg.id,
    actionId: 'weth.wrap',
    amount: arg.amount,
    inputAsset: new Asset('Ethereum', 'ETH'),
    outputAsset: new Asset('Ethereum', 'WETH'),
  }
  return rv
}

export function wethUnwrap(arg: WethBuilderArg) {
  const rv: WorkflowActionInput = {
    id: arg.id,
    actionId: 'weth.unwrap',
    amount: arg.amount,
    inputAsset: new Asset('Ethereum', 'WETH'),
    outputAsset: new Asset('Ethereum', 'ETH'),
  }
  return rv
}
