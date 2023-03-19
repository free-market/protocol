import type { EIP1193Provider } from 'eip1193-provider'
import type { ReadonlyDeep } from 'type-fest'
import type { EncodedWorkflow } from '../EncodedWorkflow'
import type { Amount, Arguments, Asset, AssetAmount, Chain, FungibleToken, Workflow } from '../model'
import type { AssetReference } from '../model/AssetReference'
import type { IWorkflowRunner } from './IWorkflowRunner'
import type { ChainOrStart, WorkflowSegment } from './WorkflowSegment'

// TODO this can be split into functions that only helpers are interested in
export interface IWorkflowInstance {
  getWorkflow(): ReadonlyDeep<Workflow>
  validateArguments(args?: Arguments): void

  // used by client to call setProvider
  getChains(): ChainOrStart[]
  // providers are required for getRemittances
  setProvider(chainOrStart: ChainOrStart, provider: EIP1193Provider): void
  getRemittances(): Promise<Record<string, AssetAmount | Amount | AssetReference>>

  getRunner(userAddress: string, args?: Arguments): Promise<IWorkflowRunner>

  getWorkflowSegments(): WorkflowSegment[]
  dereferenceAsset(assetRef: AssetReference, chain: Chain): Promise<Asset>
  encodeSegment(startStepId: string, chain: Chain, userAddress: string): Promise<EncodedWorkflow>
  getProvider(chainOrStart: ChainOrStart): EIP1193Provider
  getFrontDoorAddressForChain(chain: Chain): Promise<string>
  isTestNet(): Promise<boolean>
  getFungibleToken(symbol: string): Promise<FungibleToken | undefined>
}
