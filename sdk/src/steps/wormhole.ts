import { getTokenAsset, TokenSymbol } from '../assetInfo'
import { BlockChain, ChainName, MoneyAmount, WorkflowStep, WorkflowStepInfo } from '../types'

export class WormholeStep extends WorkflowStep {
  constructor(init: WormholeStep) {
    super(init)
    Object.assign(this, init)
  }
  sourceChain: BlockChain
  targetChain: BlockChain
}

//                             fromChain  fromToken,   toChain,   toToken
type WormholeSymbolMapTuple = [ChainName, TokenSymbol, ChainName, TokenSymbol]
const WORMHOLE_MAPPINGS: WormholeSymbolMapTuple[] = [
  ['Ethereum', 'USDC', 'Solana', 'USDCet'],
  ['Ethereum', 'USDT', 'Solana', 'USDTet'],
]

function toMappingKey(tuple: WormholeSymbolMapTuple) {
  return `${tuple[0]}.${tuple[1]}.${tuple[2]}`
}

const WORMHOLE_MAPPINGS_MAP = new Map<string, TokenSymbol>()
WORMHOLE_MAPPINGS.forEach(it => WORMHOLE_MAPPINGS_MAP.set(toMappingKey(it), it[3]))

export function getWormholeTargetSymbol(sourceChain: ChainName, sourceToken: TokenSymbol, targetChain: ChainName): TokenSymbol {
  const targetSymbol = WORMHOLE_MAPPINGS_MAP.get(toMappingKey([sourceChain, sourceToken, targetChain, '']))
  if (!targetSymbol) {
    throw new Error(`wormhole unknown output token, sourceChain=${sourceChain} sourceToken=${sourceToken} targetChain=${targetChain}`)
  }
  return targetSymbol
}

const WORMHOLE_INFO: WorkflowStepInfo = {
  stepId: 'wormhole.transfer',
  name: 'Wormhole Token Portal',
  blockchains: ['Ethereum'],
  gasEstimate: '400000',
  exchangeFee: '1',
  description: 'Enables transfering tokens to different blockchains.',
}

interface WormholeTokenTransferBuilderArgs {
  fromChain: ChainName
  fromToken: TokenSymbol
  toChain: ChainName
  amount: MoneyAmount
}

export function wormholeTokenTransfer(args: WormholeTokenTransferBuilderArgs): WorkflowStep {
  const toTokenSymbol = getWormholeTargetSymbol(args.fromChain, args.fromToken, args.toChain)
  const toAsset = getTokenAsset(args.toChain, toTokenSymbol)
  const fromAsset = getTokenAsset(args.fromChain, args.fromToken)

  return new WormholeStep({
    stepId: 'wormhole.transfer',
    inputAmount: args.amount,
    inputAsset: fromAsset,
    outputAsset: toAsset,
    info: WORMHOLE_INFO,
    sourceChain: BlockChain[args.fromChain],
    targetChain: BlockChain[args.toChain],
  })
}
