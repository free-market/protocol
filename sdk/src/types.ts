/** Represents an integer or a percentage such as "100%" */
export type MoneyAmount = bigint | string | number

/** Address of a wallet/account/contract.  Usually is a base58 encoding of a byte array, but exact specs for this string very by blockchain. */
export type Address = string

/** Enum containing all supported blockchains. */
export enum BlockChain {
  Ethereum = 'Ethereum',
  Solana = 'Solana',
}

/** The names of blockchains as a string union. */
export type ChainName = keyof typeof BlockChain

/** Enum containing all supported types of assets. */
export enum AssetType {
  token = 'token',
  account = 'account',
}

/**
 * Asset represents any form of crypto asset,
 * e.g., some amount of some token, or an account balance at some exchange.
 */
export interface Asset {
  type: AssetType
  symbol: string
  blockChain: BlockChain
  info: AssetInfo
}

/** Informational aspects of an asset. */
export interface AssetInfo {
  fullName: string
  decimals: number
  decimals2?: number
}

/** An asset along with an associated balance. */
export interface AssetBalance {
  asset: Asset
  balance: string
}

/**
 * A parameterized workflow step.
 *  This is a common base class, subclasses can add step-specific parameters unique to their step.
 */
export class WorkflowStep {
  constructor(init: WorkflowStep) {
    Object.assign(this, init)
  }
  stepId: string
  inputAmount: MoneyAmount
  inputAsset: Asset
  outputAsset: Asset | 'none'
  info: WorkflowStepInfo
}

/**
 *  Informational aspects of a workflow step (no runtime parameters here).
 */
export interface WorkflowStepInfo {
  stepId: string
  name: string
  blockchains: ChainName[]
  gasEstimate: string
  exchangeFee: string
  description: string
}

/**
 * The outcome of executing a workflow step.
 *
 * @privateRemarks
 * This fits sign-every but not a good fit for 1-click.
 */
export interface WorkflowStepResult {
  outputAmount: string
  gasCost: string
  exchangeFee: string
  // slippage: string
}

/**
 * A workflow.
 */
export interface Workflow {
  steps: WorkflowStep[]
}
