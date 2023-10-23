import axios from 'axios'
import z from 'zod'
import { AssetReference, Chain, Asset, FungibleToken, fungibleTokenSchema } from '../model'
import { AssetNotFoundError, AssetNotFoundProblem } from '../runner'
import { NATIVE_ASSETS } from './NativeAssets'
import { translateChain } from './evm-utils'
import { Memoize } from './memoize-decorator'
import { assert } from './assert'

export type AddressToSymbol = Record<string, string>

export class AssetInfoService {
  static async dereferenceAsset(assetRef: AssetReference, chain: Chain, fungibleTokens: FungibleToken[]): Promise<Asset> {
    assert(typeof assetRef !== 'string')
    if (assetRef.type === 'native') {
      const nativeAsset = NATIVE_ASSETS[chain]
      if (!nativeAsset) {
        throw new AssetNotFoundError([new AssetNotFoundProblem(null, chain)])
      }
      return nativeAsset
    }
    const token = await AssetInfoService.getFungibleToken(assetRef.symbol, fungibleTokens)
    if (!token) {
      throw new AssetNotFoundError([new AssetNotFoundProblem(assetRef.symbol, null)])
    }
    const c = translateChain(chain)
    if (!token.chains[c as Chain]) {
      throw new AssetNotFoundError([new AssetNotFoundProblem(assetRef.symbol, chain)])
    }
    return token
    // return {
    //   type: 'fungible-token',
    //   symbol: assetRef.symbol,
    //   name: 'foo',
    //   chains: {},
    // }
  }

  @Memoize()
  static async getDefaultFungibleTokens(): Promise<Record<string, FungibleToken>> {
    console.log('requesting default fungible tokens')
    const response = await axios.get('https://metadata.fmprotocol.com/tokens.json')
    console.log('received default fungible tokens')
    const tokenSchema = z.record(z.string(), fungibleTokenSchema)
    console.log('about to parse')
    try {
      return tokenSchema.parse(response.data)
    } catch (e) {
      console.log('error parsing default fungible tokens')
      console.log(e)
      throw e
    }
  }

  static async getFungibleToken(symbol: string, fungibleTokens: FungibleToken[]): Promise<FungibleToken | undefined> {
    if (fungibleTokens) {
      for (const asset of fungibleTokens) {
        if (asset.symbol === symbol) {
          return asset
        }
      }
    }
    const defaultTokens = await AssetInfoService.getDefaultFungibleTokens()
    return defaultTokens[symbol]
  }

  @Memoize()
  static async getDefaultFungibleTokensByAddress(): Promise<Record<string, AddressToSymbol>> {
    const response = await axios.get('https://metadata.fmprotocol.com/tokens-by-address.json')
    return response.data
  }

  @Memoize()
  static async getFungibleTokenByChainAndAddress(
    chain: Chain,
    address: string,
    fungibleTokens: FungibleToken[]
  ): Promise<FungibleToken | undefined> {
    const mapAddressToSymbol = await AssetInfoService.getDefaultFungibleTokensByAddress()
    const c = translateChain(chain)
    const symbol = mapAddressToSymbol[c]?.[address]
    if (!symbol) {
      return undefined
    }
    return AssetInfoService.getFungibleToken(symbol, fungibleTokens)
  }
}
