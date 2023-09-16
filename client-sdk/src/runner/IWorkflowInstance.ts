import type { ChainOrStart, IWorkflow, AssetReference, Amount, AssetAmount, FungibleToken, Chain, IStepHelper } from '@freemarket/core'
import type { EIP1193Provider } from 'eip1193-provider'
import type { ReadonlyDeep } from 'type-fest'
import type { Arguments, Workflow } from '../model'

import type { IWorkflowRunner } from './IWorkflowRunner'
import type { WorkflowSegment } from './WorkflowSegment'
import { EvmTransactionExecutor } from './EvmTransactionExecutor'

export interface IWorkflowInstance extends IWorkflow {
  //////
  // providers are required for getRemittances
  setProvider(chainOrStart: ChainOrStart, provider: EIP1193Provider, nonForkedProvider?: EIP1193Provider): void
  setTransactionExecutor(chainOrStart: ChainOrStart, executor: EvmTransactionExecutor): void
  getTransactionExecutor(chainOrStart: ChainOrStart): EvmTransactionExecutor | undefined

  getWorkflow(): ReadonlyDeep<Workflow>
  validateArguments(args?: Arguments): void

  // used by client to call setProvider
  getChains(): ChainOrStart[]
  getRemittances(): Promise<Record<string, AssetAmount | Amount | AssetReference>>

  getRunner(userAddress: string, args?: Arguments, isDebug?: boolean): Promise<IWorkflowRunner>

  getWorkflowSegments(): WorkflowSegment[]
  getFungibleToken(symbol: string): Promise<FungibleToken | undefined>
  getFungibleTokenByChainAndAddress(chain: Chain, address: string): Promise<FungibleToken | undefined>
  getStepHelper(chainOrStart: ChainOrStart, type: string): IStepHelper<any>
}
