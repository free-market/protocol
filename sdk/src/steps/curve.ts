import { getTokenAsset } from '../assetInfo'
import { MoneyAmount, WorkflowStep, WorkflowStepInfo } from '../types'

/** the set of tokens than can be swapped by Curve 3Pool */
export type ThreePoolTokenSymbol = 'DAI' | 'USDT' | 'USDC'

/** the set of tokens than can be swapped by Curve TriCrypto */
export type TriCryptoTokenSymbol = 'WETH' | 'WBTC' | 'USDT'

export interface CurveStep extends WorkflowStep {
  inputIndex: number
  outputIndex: number
}
/**
 * Arguments for Curve workflow steps
 *  @typeParam Symbols - The allowable set of crypto symbols (as a string union)
 */
export interface CurveStepBuilderArgs<Symbols> {
  /** the token the Curve workflow step will swap from */
  from: Symbols
  /** the token the Curve workflow step will swap to */
  to: Symbols
  /** the amount to swap (in term of the from token) */
  amount: MoneyAmount
}

const THREE_CURVE_SWAP: WorkflowStepInfo = {
  stepId: 'curve.3pool.swap',
  name: 'Curve 3 Pool',
  blockchains: ['Ethereum'],
  gasEstimate: '20',
  exchangeFee: '1',
  description: 'Three Pool at Curve Finance allows swapping between stable coins with very low fees.',
  iconUrl: 'https://curve.fi/favicon-32x32.svg',
  webSiteUrl: 'https://curve.fi/',
}
const TRICRYPTO_SWAP: WorkflowStepInfo = {
  stepId: 'curve.tricrypto.swap',
  name: 'Curve TriCrypto',
  blockchains: ['Ethereum'],
  gasEstimate: '40',
  exchangeFee: '1',
  description: 'TriCrypto does swapping between the 3 most popular tokens on Ethereum: WBTC, WETH and USDT',
  iconUrl: 'https://curve.fi/favicon-32x32.svg',
  webSiteUrl: 'https://curve.fi/',
}

/** define a workflow step that does a token swap using Curve 3Pool */
export function curveThreePoolSwap(args: CurveStepBuilderArgs<ThreePoolTokenSymbol>): WorkflowStep {
  const rv: CurveStep = {
    stepId: 'curve.3pool.swap',
    inputAmount: args.amount,
    inputAsset: getTokenAsset('Ethereum', args.from),
    outputAsset: getTokenAsset('Ethereum', args.to),
    inputIndex: 0, // TODO unhardcode
    outputIndex: 0,
    info: THREE_CURVE_SWAP,
  }
  return rv
}

/** define a workflow step that does a token swap using Curve 3Pool */
export function curveTriCryptoSwap(args: CurveStepBuilderArgs<TriCryptoTokenSymbol>): WorkflowStep {
  const rv: CurveStep = {
    stepId: 'curve.tricrypto.swap',
    inputAmount: args.amount,
    inputAsset: getTokenAsset('Ethereum', args.from),
    outputAsset: getTokenAsset('Ethereum', args.to),
    inputIndex: 0, // TODO unhardcode
    outputIndex: 0,
    info: TRICRYPTO_SWAP,
  }
  return rv
}
