import { ActionBuilderArg, WorkflowActionInput } from '../builder/WorkflowBuilder'
import { ChainName, WorkflowStepCategory, WorkflowActionInfo, Asset } from '../types'

export const ThreePoolTokenSymbols = ['DAI', 'USDT', 'USDC'] as const

/** the set of tokens than can be swapped by Curve 3Pool */
export type ThreePoolTokenSymbol = typeof ThreePoolTokenSymbols[number]

/** the set of tokens than can be swapped by Curve TriCrypto */
export const TriCryptoTokenSymbols = ['WETH', 'WBTC', 'USDT'] as const
export type TriCryptoTokenSymbol = typeof TriCryptoTokenSymbols[number]

export interface CurveAction extends WorkflowActionInput {
  chain: ChainName
}

export const CURVE_3POOL_SWAP_INFO: WorkflowActionInfo = {
  actionId: 'curve.3pool.swap',
  name: 'Curve 3 Pool Swap',
  chains: ['Ethereum'],
  gasEstimate: '20',
  exchangeFee: '1',
  category: WorkflowStepCategory.Swap,
  description: 'Three Pool at Curve Finance allows swapping between stable coins with very low fees.',
  iconUrl: 'https://curve.fi/favicon-32x32.png',
  webSiteUrl: 'https://curve.fi/',
}

export const CURVE_TRICRYPTO_SWAP: WorkflowActionInfo = {
  actionId: 'curve.tricrypto.swap',
  name: 'Curve TriCrypto Swap',
  chains: ['Ethereum'],
  gasEstimate: '40',
  exchangeFee: '1',
  category: WorkflowStepCategory.Swap,
  description: 'TriCrypto allows swapping between the 3 most popular tokens on Ethereum: WBTC, WETH and USDT',
  iconUrl: 'https://curve.fi/favicon-32x32.png',
  webSiteUrl: 'https://curve.fi/',
}

/** define a workflow step that does a token swap using Curve 3Pool */
export function curveThreePoolSwap(args: CurveBuilderArgs): CurveAction {
  const inputAsset = new Asset(args.chain, args.from)

  const rv: CurveAction = {
    id: args.id,
    chain: inputAsset.chain,
    actionId: 'curve.3pool.swap',
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
export interface CurveBuilderArgs extends ActionBuilderArg {
  chain: ChainName
  /** the token the Curve workflow step will swap from */
  from: string
  /** the token the Curve workflow step will swap to */
  to: string
}

/** define a workflow step that does a token swap using Curve 3Pool */
export function curveTriCryptoSwap(args: CurveBuilderArgs): CurveAction {
  const inputAsset = new Asset(args.chain, args.from)
  const rv: CurveAction = {
    id: args.id,
    chain: inputAsset.chain,
    actionId: 'curve.tricrypto.swap',
    amount: args.amount,
    inputAsset: inputAsset,
    outputAsset: new Asset(args.chain, args.to),
  }
  return rv
}
