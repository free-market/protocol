import {
  Asset,
  AssetReference,
  Chain,
  ChainOrStart,
  EncodedWorkflow,
  EvmWorkflow,
  FungibleToken,
  IWorkflow,
  getDefaultFungibleTokens,
  nonEmptyStringSchema,
} from '@freemarket/core'
import type EIP1193Provider from 'eip1193-provider'
import { Memoize } from 'typescript-memoize'

export class MockWorkflowInstance implements IWorkflow {
  // map symbol to erc20 contract address
  private erc20s = new Map<string, string>()

  testNet = false
  frontDoorAddress?: string

  getFrontDoorAddressForChain(chain: Chain): Promise<string> {
    if (!this.frontDoorAddress) {
      throw new Error('frontDoorAddress not set in not MockWorkflowInstance')
    }
    return Promise.resolve(this.frontDoorAddress)
  }

  async dereferenceAsset(assetRef: AssetReference, chain: Chain): Promise<Asset> {
    if (typeof assetRef === 'string') {
      throw new Error('dereferencing string asset refs is not supported')
    }
    if (assetRef.type === 'native') {
      if (chain !== 'ethereum') {
        throw new Error('dereferencing native assets is not supported on chain: ' + chain)
      }
      return {
        type: 'native',
        name: 'Ether',
        symbol: 'ETH',
        chain,
      }
    }

    const address = this.erc20s.get(assetRef.symbol)
    if (address) {
      const chains: FungibleToken['chains'] = {}
      chains[chain] = {
        address,
        decimals: 18,
      }

      const rv: FungibleToken = {
        chains,
        symbol: assetRef.symbol,
        type: 'fungible-token',
      }
      return rv
    }

    const defaults = await this.getDefaultFungibleTokens()
    const ft = defaults[assetRef.symbol]
    if (ft) {
      return ft
    }
    throw new Error('could not deference asset, symbol not found: ' + assetRef.symbol)
  }

  @Memoize()
  getDefaultFungibleTokens() {
    return getDefaultFungibleTokens()
  }
  isTestNet(): Promise<boolean> {
    return Promise.resolve(this.testNet)
  }
  getProvider(chainOrStart: ChainOrStart): EIP1193Provider {
    throw new Error('not implemented')
  }
  encodeSegment(startStepId: string, chain: Chain, userAddress: string, runnerAddress: string): Promise<EncodedWorkflow> {
    throw new Error('not implemented')
  }

  registerErc20(symbol: string, address: string) {
    this.erc20s.set(symbol, address)
  }
}
