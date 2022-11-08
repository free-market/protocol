import ethers from 'ethers'
// import { Connection as SolanaConnection, Keypair as SolanaKeypair } from '@solana/web3.js'
import { AssetBalance, Workflow, WorkflowStep, WorkflowStepResult } from '../types'

export type EthereumProvider = ethers.providers.ExternalProvider | ethers.providers.JsonRpcFetchFunc

// TODO there should be step level events and workflow level events (like workflow completed)
export enum WorkflowEventType {
  Starting = 'Starting',
  Submitted = 'Submitted',
  StatusUpdate = 'StatusUpdate',
  Completed = 'Completed',
}

export interface WorkflowEvent {
  type: WorkflowEventType
  statusMessage: string
  workflow: Workflow
  steps: WorkflowStep[]
  balances: AssetBalance[]
  absoluteInputAmount?: string
  result?: WorkflowStepResult // defined when type is Completed
}

export type WorkflowEventHandler = (event: WorkflowEvent) => void | Promise<void>

export interface WorkflowEngineOptions {
  ethereumProvider?: EthereumProvider
  // solanaConnection?: SolanaConnection
  // solanaUser?: SolanaKeypair
  eventHandler: WorkflowEventHandler
}

export interface WorkflowEngine {
  execute(workflow: Workflow, assetBalances: AssetBalance[]): Promise<void>
}
