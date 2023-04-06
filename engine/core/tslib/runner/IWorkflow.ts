import type { EIP1193Provider } from 'eip1193-provider'
import type { EncodedWorkflow } from './EncodedWorkflow'
import type { Asset, Chain } from '../model'
import type { AssetReference } from '../model/AssetReference'
import type { ChainOrStart } from './ChainOrStart'

export interface IWorkflow {
  getFrontDoorAddressForChain(chain: Chain): Promise<string>
  dereferenceAsset(assetRef: AssetReference, chain: Chain): Promise<Asset>
  isTestNet(): Promise<boolean>
  getProvider(chainOrStart: ChainOrStart): EIP1193Provider
  encodeSegment(startStepId: string, chain: Chain, userAddress: string): Promise<EncodedWorkflow>
}
