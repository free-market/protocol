import type { EIP1193Provider } from 'eip1193-provider'
import type { EncodedWorkflow } from '../EncodedWorkflow'
import type { Address, Amount, Asset, AssetAmount, Chain } from '../model'
import type { AssetReference } from '../model/AssetReference'
import type { ChainOrStart, WorkflowSegment } from './WorkflowSegment'

export interface IWorkflowRunner {
  getWorkflowSegments(): WorkflowSegment[]
  dereferenceAsset(assetRef: AssetReference, chain: Chain): Promise<Asset>
  getUserAddress(): Address
  encodeSegment(startStepId: string, chain: Chain): Promise<EncodedWorkflow>
  getChains(): ChainOrStart[]
  setProvider(chainOrStart: ChainOrStart, provider: EIP1193Provider): void
  getProvider(chainOrStart: ChainOrStart): EIP1193Provider
  getRemittances(): Promise<Record<string, AssetAmount | Amount | AssetReference>>
}
