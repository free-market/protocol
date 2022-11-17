/** Represents an integer or a percentage such as "100%" */
export type AssetAmount = string | number

/** Enum containing all supported blockchains. */
export enum Chain {
  Ethereum = 'Ethereum',
  Solana = 'Solana',
  ZkSync = 'ZkSync',
  Sui = 'Sui',
}

/** The names of blockchains as a string union. */
export type ChainName = keyof typeof Chain

export interface BlockChainInfo {
  iconUrl: string
}

export type ChainInfos = { [name: string]: BlockChainInfo }

/** Enum containing all supported types of assets. */
export enum AssetType {
  Native = 'Native',
  Token = 'Token',
  Account = 'Account',
}

/**
 * A compound key of a crypto asset.
 */
export class Asset {
  constructor(chain: ChainName, symbol: string) {
    this.chain = chain
    this.symbol = symbol
  }

  chain: ChainName
  symbol: string

  toString() {
    return `${this.chain}.${this.symbol}`
  }

  static fromString(s: string): Asset {
    const dotIndex = s.indexOf('.')
    return new Asset(s.slice(0, dotIndex) as ChainName, s.slice(dotIndex + 1))
  }
}

/** Informational aspects of an asset. */
export interface AssetInfo {
  name: string
  symbol: string
  address: string
  iconUrl: string
  decimals: number
  officialSiteUrl: string
  type: AssetType
}

/** An assetId and an associated balance. */
export interface AssetBalance {
  asset: Asset
  balance: string
}

/**
 * A parameterized workflow step.
 *  This is a common base class, subclasses can add step-specific parameters unique to their step.
 */
export interface WorkflowStep {
  stepId: string
}

export interface WorkflowAction extends WorkflowStep {
  actionId: string
  inputAmount: AssetAmount
  inputAsset: Asset
  outputAsset: Asset
}

export interface WorkflowBranch extends WorkflowStep {
  expression: string // TODO arbitrary expressions may be too expensive to implement on-chain
  ifTrue: string
  ifFalse: string
}

/**
 *  The categories of workflow steps.
 *  TODO maybe should align with defillama's categories https://defillama.com/categories
 *  TODO currently not used
 */
export enum WorkflowStepCategory {
  Swap = 'Swap',
  Bridge = 'Bridge',
  Yield = 'Yield',
  Loan = 'Loan',
}

/**
 *  Informational aspects of a workflow step (no runtime parameters here).
 */
export interface WorkflowActionInfo {
  actionId: string
  name: string
  description: string
  category: WorkflowStepCategory // TODO maybe align with defillama's categories
  chains: ChainName[]
  gasEstimate: string
  exchangeFee: string
  iconUrl: string
  webSiteUrl: string
}

/**
 * The outcome of executing a workflow step.
 */
export interface WorkflowStepResult {
  outputAmount: string
  gasCost: string // TODO need a better modeling of gas is needed
  exchangeFee: string
  // slippage: string
}

/**
 * A workflow.
 */
export interface Workflow {
  inputAssets: Asset[]
  steps: WorkflowStep[]
}
