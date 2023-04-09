import type { ChainOrStart, IWorkflow, AssetReference, Amount, AssetAmount, FungibleToken } from '@freemarket/core'
import type { EIP1193Provider } from 'eip1193-provider'
import type { ReadonlyDeep } from 'type-fest'
import type { Arguments, Workflow } from '../model'

import type { IWorkflowRunner } from './IWorkflowRunner'
import type { WorkflowSegment } from './WorkflowSegment'

// TODO this can be split into functions that only helpers are interested in
export interface IWorkflowInstance extends IWorkflow {
  //////
  // providers are required for getRemittances
  setProvider(chainOrStart: ChainOrStart, provider: EIP1193Provider): void

  getWorkflow(): ReadonlyDeep<Workflow>
  validateArguments(args?: Arguments): void

  // used by client to call setProvider
  getChains(): ChainOrStart[]
  getRemittances(): Promise<Record<string, AssetAmount | Amount | AssetReference>>

  getRunner(userAddress: string, args?: Arguments): Promise<IWorkflowRunner>

  getWorkflowSegments(): WorkflowSegment[]
  getFungibleToken(symbol: string): Promise<FungibleToken | undefined>
}
