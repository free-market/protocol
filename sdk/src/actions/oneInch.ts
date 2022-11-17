import { ActionBuilderArg, WorkflowActionInput } from '../builder/WorkflowBuilder'
import { ChainName, WorkflowStepCategory, WorkflowActionInfo, Asset } from '../types'

export interface OneInchAction extends WorkflowActionInput {
  chain: ChainName
  inputAsset: Asset
  outputAsset: Asset
}

export const ONEINCH_SWAP_ACTION: WorkflowActionInfo = {
  actionId: '1inch.swap',
  name: '1inch Swap',
  chains: ['Ethereum', 'ZkSync'],
  gasEstimate: '20',
  exchangeFee: '1',
  category: WorkflowStepCategory.Swap,
  description: '1inch optimizes swaps across hundres of DEXes on multiple networks',
  iconUrl: 'https://1inch.io/img/favicon/favicon-32x32.png',
  webSiteUrl: 'https://1inch.io',
}

/** define a workflow step that does a token swap using Curve 3Pool */
export function oneInchSwap(args: OneInchArgs): OneInchAction {
  const inputAsset = new Asset(args.chain, args.from)
  const rv: OneInchAction = {
    id: args.id,
    actionId: '1inch.swap',
    chain: inputAsset.chain,
    amount: args.amount,
    inputAsset: inputAsset,
    outputAsset: new Asset(args.chain, args.to),
  }
  return rv
}

/**
 * Arguments for Curve workflow steps
 *  @typeParam Symbol - The allowable set of crypto symbols (as a string union)
 */
export interface OneInchArgs extends ActionBuilderArg {
  chain: ChainName
  /** the token the Curve workflow step will swap from */
  from: string
  /** the token the Curve workflow step will swap to */
  to: string
}
