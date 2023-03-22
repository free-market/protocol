import {
  Asset,
  AssetReference,
  Chain,
  ChainOrStart,
  EncodedWorkflow,
  EvmWorkflow,
  FungibleToken,
  IWorkflowInstance,
} from '@freemarket/core'
import EIP1193Provider from 'eip1193-provider'

export class MockWorkflowInstance implements IWorkflowInstance {
  // map symbol to erc20 contract address
  private erc20s = new Map<string, string>()

  getFrontDoorAddressForChain(chain: Chain): Promise<string> {
    throw new Error('not implemented')
  }
  dereferenceAsset(assetRef: AssetReference, chain: Chain): Promise<Asset> {
    if (typeof assetRef === 'string') {
      throw new Error('dereferencing string asset refs is not supported')
    }
    if (assetRef.type === 'native') {
      throw new Error('dereferencing native assets is not supported')
    }
    const address = this.erc20s.get(assetRef.symbol)
    if (!address) {
      throw new Error('could not deference asset, symbol not found: ' + assetRef.symbol)
    }

    const chains: FungibleToken['chains'] = {}
    chains[chain] = {
      address,
    }

    const rv: FungibleToken = {
      chains,
      symbol: assetRef.symbol,
      type: 'fungible-token',
    }
    return Promise.resolve(rv)
  }
  isTestNet(): Promise<boolean> {
    throw new Error('not implemented')
  }
  getProvider(chainOrStart: ChainOrStart): EIP1193Provider {
    throw new Error('not implemented')
  }
  encodeSegment(startStepId: string, chain: Chain, userAddress: string): Promise<EncodedWorkflow> {
    throw new Error('not implemented')
  }

  registerErc20(symbol: string, address: string) {
    this.erc20s.set(symbol, address)
  }
}
