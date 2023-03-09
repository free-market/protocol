import type { Address, Asset, Chain } from '../model'
import type { AssetReference } from '../model/AssetReference'
import type { WorkflowSegment } from './WorkflowSegment'

export interface IWorkflowRunner {
  getWorkflowSegments(): WorkflowSegment[]
  dereferenceAsset(assetRef: AssetReference, chain: Chain): Promise<Asset>
  getUserAddress(): Address
  validateAssetRefs(startChain: Chain): Promise<void>
}
