import { ActionBuilderArg, WorkflowActionInput } from '../builder/WorkflowBuilder'
import { ChainName, WorkflowStepCategory, WorkflowActionInfo, Asset } from '../types'

export const ZKSYNC_BRIDGE_ACTION: WorkflowActionInfo = {
  actionId: 'zksync.bridge',
  name: 'ZkSync Bridge',
  chains: ['Ethereum', 'ZkSync'],
  gasEstimate: '20',
  exchangeFee: '1',
  category: WorkflowStepCategory.Bridge,
  description: 'Allows transfer of assets to and from ZkSync.',
  iconUrl: 'https://zksync.io/icons/favicon-32x32.png',
  webSiteUrl: 'https://zksync.io',
}

/**
 * Arguments for Curve workflow steps
 *  @typeParam Symbol - The allowable set of crypto symbols (as a string union)
 */
export interface ZkSyncBridgeArgs extends ActionBuilderArg {
  fromChain: ChainName
  /** the token the Curve workflow step will swap from */
  token: string
}

/** define a workflow step that does a token swap using Curve 3Pool */
export function zkSyncBridge(args: ZkSyncBridgeArgs): WorkflowActionInput {
  const outputChain = args.fromChain === 'Ethereum' ? 'ZkSync' : 'Ethereum'
  const rv: WorkflowActionInput = {
    id: args.id,
    actionId: 'zksync.bridge',
    amount: args.amount,
    inputAsset: new Asset(args.fromChain, args.token),
    outputAsset: new Asset(outputChain, args.token),
  }
  return rv
}
