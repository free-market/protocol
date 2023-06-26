import { VoidSigner } from '@ethersproject/abstract-signer'
import { Eip1193Bridge } from '@ethersproject/experimental'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import {
  ADDRESS_ZERO,
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
  initEnv,
  Memoize,
} from '@freemarket/core'
import type { EIP1193Provider } from 'eip1193-provider'
import axios from 'axios'

initEnv()

export class MockWorkflowInstance implements IWorkflow {
  // map symbol to erc20 contract address
  private erc20s = new Map<string, string>()
  private decimals = new Map<string, number>()
  private providers = new Map<ChainOrStart, EIP1193Provider>()

  testNet = false
  frontDoorAddress?: string

  getFrontDoorAddressForChain(chain: Chain): Promise<string> {
    if (!this.frontDoorAddress) {
      throw new Error('frontDoorAddress not set in not MockWorkflowInstance')
    }
    return Promise.resolve(this.frontDoorAddress)
  }

  setProvider(chainOrStart: ChainOrStart, provider: EIP1193Provider) {
    this.providers.set(chainOrStart, provider)
  }

  @Memoize()
  private static async getDefaultFungibleTokens(): Promise<Record<string, FungibleToken>> {
    const response = await axios.get('https://metadata.fmprotocol.com/tokens.json')
    return response.data
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
        decimals: this.decimals.get(assetRef.symbol)!,
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
    const provider = this.providers.get(chainOrStart)
    if (provider) {
      return provider
    }
    const ethersProvider = new StaticJsonRpcProvider(process.env.ETHEREUM_MAINNET_URL || 'https://rpc.ankr.com/eth')
    return new Eip1193Bridge(new VoidSigner(ADDRESS_ZERO), ethersProvider)
  }
  encodeSegment(startStepId: string, chain: Chain, userAddress: string, runnerAddress: string): Promise<EncodedWorkflow> {
    throw new Error('not implemented')
  }

  registerErc20(symbol: string, address: string, decimals: number) {
    this.erc20s.set(symbol, address)
    this.decimals.set(symbol, decimals)
  }
  getNonForkedProvider(
    chain: 'ethereum' | 'arbitrum' | 'avalanche' | 'polygon' | 'binance' | 'optimism' | 'fantom' | 'hardhat'
  ): EIP1193Provider | undefined {
    return undefined
  }
}
