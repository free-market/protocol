import { TokenSymbol } from './config'

// represents an absolute numeric value or a percentage such as "100%"
export type MoneyAmount = bigint | string | number

// any wallet address type, exact format depends on the blockchain
export type Address = string

export enum BlockChain {
  ethereum = 'ethereum',
  solana = 'solana',
}

export type ChainNames = keyof typeof BlockChain

interface NetworkType {
  chain: ChainNames
  type: string
}

export interface EthereumNetwork extends NetworkType {
  chain: 'ethereum'
  type: 'mainnet' | 'goerli'
}

export interface SolanaNetwork extends NetworkType {
  chain: 'solana'
  type: 'mainnet' | 'devnet'
}

export type Network = EthereumNetwork | SolanaNetwork

// export type AssetType = 'token' | 'account'

export enum AssetType {
  token = 'token',
  account = 'account',
}

/**
 * This represents any form of monetary asset,
 * e.g., some amount of some token, or an account balance at mango.
 * If assetType is 'token' then address is the address of the token and exchange is undefined,
 * if assetType is 'balance' then exchange is non null (like 'mango')
 */
export interface Asset {
  type: AssetType
  symbol: string // WETH
  network: Network
  blockChain: BlockChain // TODO adding this redundantly for now
  fullName: string // Wrapped Ether
  decimals: number
  displayDecimals: number
}

export interface TokenAsset extends Asset {
  type: AssetType.token
  address: string
}

export interface AccountAsset extends Asset {
  type: AssetType.account
  exchangeSymbol: string
}

// a parameterized workflow step.  This is a common base class,
// each step type defines its own sublass to account for its own set of arbitrary parameters.
export class WorkflowStep {
  constructor(init: WorkflowStep) {
    Object.assign(this, init)
  }
  stepId: string
  inputAmount: MoneyAmount
  inputAsset: Asset
  outputAsset: Asset
  stepInfo: WorkflowStepInfo
}

// informational aspects of a workflow step (no runtime parameters here)
export interface WorkflowStepInfo {
  stepId: string
  name: string
  networks: Network[]
  gasEstimate: bigint
  exchangeFee: number
  description: string
}

export interface WorkflowStepResult {
  // outputToken: string
  asset: Asset // mango balance or token balance
  afterBalance: bigint
  outputAmount: bigint
  gasCost: bigint
  exchangeFee: bigint
  // slippage: bigint
}

export class CurveStep extends WorkflowStep {
  constructor(init: CurveStep) {
    super(init)
    Object.assign(this, init)
  }

  inputIndex: number
  outputIndex: number
}

export class SaberSwapStep extends WorkflowStep {
  constructor(init: SaberSwapStep) {
    super(init)
    Object.assign(this, init)
  }

  // todo
}

export class WormholeStep extends WorkflowStep {
  constructor(init: WormholeStep) {
    super(init)
    Object.assign(this, init)
  }
  sourceChain: BlockChain
  targetChain: BlockChain
  fromTokenSymbol: TokenSymbol
}

// a sequence of steps,  grouped by chain
export interface Workflow {
  steps: WorkflowStep[]
}
