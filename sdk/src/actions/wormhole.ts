import { ActionBuilderArg, WorkflowActionInput } from '../builder/WorkflowBuilder'
import { Chain, ChainName, AssetAmount, WorkflowStep, WorkflowStepCategory, WorkflowActionInfo, Asset } from '../types'

export interface WormholeStep extends WorkflowStep {
  sourceChain: Chain
  targetChain: Chain
}

// TODO use this to compute target token
// const WormholeSubTypeExtensions = {
//   so: BlockChain.Solana,
//   et: BlockChain.Ethereum,
// }

//                             fromChain  fromSy, toChain,   toSymbol
type WormholeSymbolMapTuple = [ChainName, string, ChainName, string]
const WORMHOLE_MAPPINGS: WormholeSymbolMapTuple[] = [
  ['Ethereum', 'USDC', 'Solana', 'USDCet'],
  ['Ethereum', 'USDT', 'Solana', 'USDTet'],
  ['Ethereum', 'WETH', 'Solana', 'WETHet'],
]

function toMappingKey(tuple: WormholeSymbolMapTuple) {
  return `${tuple[0]}.${tuple[1]}.${tuple[2]}`
}

const WORMHOLE_MAPPINGS_MAP = new Map<string, string>()
WORMHOLE_MAPPINGS.forEach(it => WORMHOLE_MAPPINGS_MAP.set(`${it[0]}.${it[1]}.${it[2]}`, it[3]))
WORMHOLE_MAPPINGS.forEach(it => WORMHOLE_MAPPINGS_MAP.set(`${it[2]}.${it[3]}.${it[0]}`, it[1]))

export function getWormholeTargetSymbol(sourceChain: ChainName, sourceToken: string, targetChain: ChainName): string {
  const targetSymbol = WORMHOLE_MAPPINGS_MAP.get(toMappingKey([sourceChain, sourceToken, targetChain, '']))
  if (!targetSymbol) {
    throw new Error(`wormhole unknown output token, sourceChain=${sourceChain} sourceToken=${sourceToken} targetChain=${targetChain}`)
  }
  return targetSymbol
}

export const WORMHOLE_STEP_INFO: WorkflowActionInfo = {
  actionId: 'wormhole.transfer',
  name: 'Wormhole Transfer',
  chains: ['Ethereum'],
  gasEstimate: '400000',
  exchangeFee: '1',
  category: WorkflowStepCategory.Bridge,
  description: 'Enables transfering tokens to different blockchains.',
  iconUrl: '/wormhole.png',
  webSiteUrl: 'https://www.portalbridge.com/',
}

interface WormholeTokenTransferBuilderArgs extends ActionBuilderArg {
  fromChain: ChainName
  fromToken: string
  toChain: ChainName
  amount?: AssetAmount
}

export function wormholeTokenTransfer(args: WormholeTokenTransferBuilderArgs): WorkflowActionInput {
  // supporting ethereum<->solana only
  // we have symbols in the args here
  // if it ends in et, it's a ethereum native asset on solana
  // if it ends in so, it's a solana native asset on ethereum
  const fromAsset = new Asset(args.fromChain, args.fromToken)
  let toSymbol: string
  if (fromAsset.chain === 'Ethereum') {
    if (fromAsset.symbol.endsWith('so')) {
      toSymbol = fromAsset.symbol.slice(0, fromAsset.symbol.length - 2)
    } else {
      toSymbol = fromAsset.symbol + 'et'
    }
  } else {
    if (fromAsset.symbol.endsWith('so')) {
      throw new Error(`symbol ${fromAsset.symbol} does not exist on Solana`)
    }
    if (fromAsset.symbol.endsWith('et')) {
      toSymbol = fromAsset.symbol.slice(0, fromAsset.symbol.length - 2)
    } else {
      toSymbol = fromAsset.symbol + 'so'
    }
  }

  const toAsset = new Asset(args.toChain, toSymbol)

  const rv = {
    id: args.id,
    actionId: 'wormhole.transfer',
    amount: args.amount,
    inputAsset: fromAsset,
    outputAsset: toAsset,
    sourceChain: fromAsset.chain,
    targetChain: toAsset.chain,
  }
  return rv
}
