import { getTokenAsset } from '../assetInfo'
import { MoneyAmount, WorkflowStep, WorkflowStepInfo } from '../types'

export type ThreePoolTokenSymbol = 'DAI' | 'USDT' | 'USDC'
export type TriCryptoTokenSymbol = 'WETH' | 'WBTC' | 'USDT'

export class CurveStep extends WorkflowStep {
  constructor(init: CurveStep) {
    super(init)
    Object.assign(this, init)
  }
  inputIndex: number
  outputIndex: number
}

interface CurveStepBuilderArgs<Symbol> {
  from: Symbol
  to: Symbol
  amount: MoneyAmount
}

const THREE_CURVE_SWAP: WorkflowStepInfo = {
  stepId: 'curve.3pool.swap',
  name: 'Curve 3 Pool',
  blockchains: ['Ethereum'],
  gasEstimate: BigInt(400_000),
  exchangeFee: 0.01,
  description: 'Three Pool at Curve Finance allows swapping between stable coins with very low fees.',
}
const TRICRYPTO_SWAP: WorkflowStepInfo = {
  stepId: 'curve.tricrypto.swap',
  name: 'Curve TriCrypto',
  blockchains: ['Ethereum'],
  gasEstimate: BigInt(400_000),
  exchangeFee: 0.01,
  description: 'TriCrypto does swapping between the 3 most popular tokens on Etherium: WBTC, WETH and USDT',
}

export function curveThreePoolSwap(args: CurveStepBuilderArgs<ThreePoolTokenSymbol>): WorkflowStep {
  return new CurveStep({
    stepId: 'curve.3pool.swap',
    inputAmount: args.amount,
    inputAsset: getTokenAsset('Ethereum', args.from),
    outputAsset: getTokenAsset('Ethereum', args.to),
    inputIndex: 0, // TODO unhardcode
    outputIndex: 0,
    info: THREE_CURVE_SWAP,
  })
}
export function curveTriCryptoSwap(args: CurveStepBuilderArgs<TriCryptoTokenSymbol>): WorkflowStep {
  return new CurveStep({
    stepId: 'curve.tricrypto.swap',
    inputAmount: args.amount,
    inputAsset: getTokenAsset('Ethereum', args.from),
    outputAsset: getTokenAsset('Ethereum', args.to),
    inputIndex: 0, // TODO unhardcode
    outputIndex: 0,
    info: TRICRYPTO_SWAP,
  })
}
