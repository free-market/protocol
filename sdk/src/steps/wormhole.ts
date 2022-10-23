import { getTokenAsset, TokenSymbol } from '../assetInfo'
import { BlockChain, ChainName, MoneyAmount, WorkflowStep, WorkflowStepCategory, WorkflowStepInfo } from '../types'

export interface WormholeStep extends WorkflowStep {
  sourceChain: BlockChain
  targetChain: BlockChain
}

// TODO use this to compute target token
// const WormholeSubTypeExtensions = {
//   so: BlockChain.Solana,
//   et: BlockChain.Ethereum,
// }

//                             fromChain  fromToken,   toChain,   toToken
type WormholeSymbolMapTuple = [ChainName, TokenSymbol, ChainName, TokenSymbol]
const WORMHOLE_MAPPINGS: WormholeSymbolMapTuple[] = [
  ['Ethereum', 'USDC', 'Solana', 'USDCet'],
  ['Ethereum', 'USDT', 'Solana', 'USDTet'],
  ['Ethereum', 'WETH', 'Solana', 'WETHet'],
]

function toMappingKey(tuple: WormholeSymbolMapTuple) {
  return `${tuple[0]}.${tuple[1]}.${tuple[2]}`
}

const WORMHOLE_MAPPINGS_MAP = new Map<string, TokenSymbol>()
WORMHOLE_MAPPINGS.forEach(it => WORMHOLE_MAPPINGS_MAP.set(`${it[0]}.${it[1]}.${it[2]}`, it[3]))
WORMHOLE_MAPPINGS.forEach(it => WORMHOLE_MAPPINGS_MAP.set(`${it[2]}.${it[3]}.${it[0]}`, it[1]))

export function getWormholeTargetSymbol(sourceChain: ChainName, sourceToken: TokenSymbol, targetChain: ChainName): TokenSymbol {
  const targetSymbol = WORMHOLE_MAPPINGS_MAP.get(toMappingKey([sourceChain, sourceToken, targetChain, '']))
  if (!targetSymbol) {
    throw new Error(`wormhole unknown output token, sourceChain=${sourceChain} sourceToken=${sourceToken} targetChain=${targetChain}`)
  }
  return targetSymbol
}

export const WORMHOLE_STEP_INFO: WorkflowStepInfo = {
  stepId: 'wormhole.transfer',
  name: 'Wormhole Transfer',
  blockchains: ['Ethereum'],
  gasEstimate: '400000',
  exchangeFee: '1',
  category: WorkflowStepCategory.Bridge,
  description: 'Enables transfering tokens to different blockchains.',
  iconUrl: '/wormhole.png',
  webSiteUrl: 'https://www.portalbridge.com/',
}

interface WormholeTokenTransferBuilderArgs {
  fromChain: ChainName
  fromToken: TokenSymbol
  toChain: ChainName
  amount?: MoneyAmount
}

export function wormholeTokenTransfer(args: WormholeTokenTransferBuilderArgs): WorkflowStep {
  const toTokenSymbol = getWormholeTargetSymbol(args.fromChain, args.fromToken, args.toChain)
  const toAsset = getTokenAsset(args.toChain, toTokenSymbol)
  const fromAsset = getTokenAsset(args.fromChain, args.fromToken)

  const rv: WormholeStep = {
    stepId: 'wormhole.transfer',
    inputAmount: args.amount || '100%',
    inputAsset: fromAsset,
    outputAsset: toAsset,
    info: WORMHOLE_STEP_INFO,
    sourceChain: BlockChain[args.fromChain],
    targetChain: BlockChain[args.toChain],
  }
  return rv
}
