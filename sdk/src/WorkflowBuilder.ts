import { Address, BlockChain, CurveStep, MoneyAmount, SaberSwapStep, Workflow, WorkflowStep, WorkflowStepResult, WormholeStep } from './api'
import {
  getTokenAsset,
  getWormholeTargetSymbol,
  SolanaSymbol,
  STEP_INFOS,
  TokenConfig,
  TOKENS,
  TokenSymbol,
  WORMHOLE_TRANSFERS,
} from './config'
// TODO not sure exactly what transactions look like for these chains
export type EtheriumTransaction = any
export type SolanaTransaction = any
export type ThreePoolTokenSymbol = 'DAI' | 'USDT' | 'USDC'
export type TriCryptoTokenSymbol = 'WETH' | 'WBTC' | 'USDT'
export type SaberTokenSymbol = 'USDCet' | 'USDC'
export type MarinadeTokenSymbol = 'SOL' | 'mSOL'
export type MangoTokenSymbol = 'SOL' | 'USDC'

export type DoWhileCallback = (stepResult: WorkflowStepResult) => boolean | Promise<boolean>

export type ChainName = keyof typeof BlockChain

export interface WorkflowBuilderOptions {
  isTestNet?: boolean
}

export class WorkflowBuilder {
  // private  keyPairs = new Map<BlockChain, string>()
  private options: WorkflowBuilderOptions
  private steps = [] as WorkflowStep[]

  constructor(options: WorkflowBuilderOptions = {}) {
    this.options = options
  }

  // should move to wfe
  // todo needs docs stating format of strings
  // setkeyPair(blockChain: Chain, keyPair: string ): WorkflowBuilder {
  //     this.keyPairs.set(toBlockchain(blockChain), keyPair)
  //     return this
  // }

  // callbacks to do signing (we don't need setKeyPair AND these signing callbacks)
  signEtherium?: (transaction: EtheriumTransaction) => void | Promise<void>
  signSolana?: (transaction: SolanaTransaction) => void | Promise<void>

  weth = {
    wrap: wethWrap,
    unwrap: wethUnwrap,
  }

  curve = {
    threePool: {
      swap: curveThreePoolSwap,
      // addLiquidity: (from: ThreeCurveToken[], amount: MoneyAmount ) => WorkflowStep
    },
    triCrypto: {
      swap: curveTriCryptoSwap,
      //     addLiquidity: (from: TriCryptoToken[], amount: MoneyAmount ) => WorkflowStep
    },
  }

  wormhole = {
    transfer: wormholeTokenTransfer,
  }
  // mango: {
  //     deposit: (token: MangoToken, amount: MoneyAmount) => WorkflowStep
  //     withdrawal: (token: MangoToken, amount: MoneyAmount) => WorkflowStep

  // }
  saber = {
    swap: saberSwap,
  }
  // marinade: {
  //     loan: (from: MarinadeToken,  amount: MoneyAmount) => WorkflowStep
  //     borrow: (to: MarinadeToken, amount: MoneyAmount) => WorkflowStep
  // }

  addSteps(...steps: WorkflowStep[]): WorkflowBuilder {
    this.steps = this.steps.concat(steps)
    return this
  }

  build(): Workflow {
    return { steps: this.steps }
  }
  // doWhile(steps: WorkflowStep[], callback: DoWhileCallback) => WorkflowBuilder

  // private toNetwork(chain: Chain): Network {
  //     switch (chain) {
  //         case 'ETHEREUM':
  //             return {
  //                 chain: 'ethereum',
  //                 type: this.options.isTestNet ? 'goerli' : 'mainnet'
  //             }
  //         case 'SOLANA':
  //         return {
  //             chain: 'solana',
  //             type:  this.options.isTestNet? 'devnet' : 'mainnet'
  //         }
  //     }
  // }
}

// function toBlockchain(chain: Chain): BlockChain {
//   switch (chain) {
//     case 'ETHEREUM':
//       return BlockChain.ETHEREUM
//     case 'SOLANA':
//       return BlockChain.SOLANA
//   }
//   return chain
// }

function curveThreePoolSwap(from: ThreePoolTokenSymbol, to: ThreePoolTokenSymbol, amount: MoneyAmount): WorkflowStep {
  return new CurveStep({
    stepId: 'curve.3pool.swap',
    inputAmount: amount,
    inputAsset: TOKENS.ethereum[from],
    outputAsset: TOKENS.ethereum[to],
    inputIndex: 0, // TODO unhardcode
    outputIndex: 0,
    stepInfo: STEP_INFOS['curve.3pool.swap'],
  })
}
function curveTriCryptoSwap(from: TriCryptoTokenSymbol, to: TriCryptoTokenSymbol, amount: MoneyAmount): WorkflowStep {
  return new CurveStep({
    stepId: 'curve.tricrypto.swap',
    inputAmount: amount,
    inputAsset: TOKENS.ethereum[from],
    outputAsset: TOKENS.ethereum[to],
    inputIndex: 0, // TODO unhardcode
    outputIndex: 0,
    stepInfo: STEP_INFOS['curve.tricrypto.swap'],
  })
}

function wethWrap(amount: MoneyAmount) {
  return new WorkflowStep({
    stepId: 'weth.wrap',
    inputAmount: amount,
    inputAsset: TOKENS.ethereum.ETH,
    outputAsset: TOKENS.ethereum.WETH,
    stepInfo: STEP_INFOS['weth.wrap'],
  })
}
function wethUnwrap(amount: MoneyAmount) {
  return new WorkflowStep({
    stepId: 'weth.unwrap',
    inputAmount: amount,
    inputAsset: TOKENS.ethereum.ETH,
    outputAsset: TOKENS.ethereum.WETH,
    stepInfo: STEP_INFOS['weth.unwrap'],
  })
}

function wormholeTokenTransfer(fromChain: ChainName, fromTokenSymbol: TokenSymbol, toChain: ChainName, amount: MoneyAmount): WorkflowStep {
  const fromAsset = getTokenAsset(fromChain, fromTokenSymbol)
  const toTokenSymbol = getWormholeTargetSymbol(fromChain, fromTokenSymbol, toChain)
  const toAsset = getTokenAsset(toChain, toTokenSymbol)

  return new WormholeStep({
    stepId: 'wormhole.transfer',
    inputAmount: amount,
    inputAsset: fromAsset,
    outputAsset: toAsset,
    stepInfo: STEP_INFOS['wormhole.transfer'],
    sourceChain: BlockChain[fromChain],
    targetChain: BlockChain[toChain],
    fromTokenSymbol: fromTokenSymbol,
  })
}

function saberSwap(from: SaberTokenSymbol, to: SaberTokenSymbol, amount: MoneyAmount): WorkflowStep {
  return new SaberSwapStep({
    stepId: 'saber.swap',
    inputAmount: amount,
    inputAsset: getTokenAsset('solana', from),
    outputAsset: getTokenAsset('solana', to),
    stepInfo: STEP_INFOS['saber.swap'],
  })
}

// function saberSwap()
