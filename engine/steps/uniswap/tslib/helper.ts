import rootLogger from 'loglevel'
const logger = rootLogger.getLogger('UniswapExactInHelper')

import {
  EncodingContext,
  EncodedWorkflowStep,
  sdkAssetAmountToEvmInputAmount,
  assert,
  ADDRESS_ZERO,
  EvmAssetType,
  AssetAmount,
  Asset,
  sdkAssetToEvmAsset,
  AssetReference,
  EvmAsset,
  FungibleTokenChainInfo,
  Chain,
} from '@freemarket/core'
import { AbstractStepHelper, AssetSchema } from '@freemarket/step-sdk'
import type { UniswapExactIn } from './model'
// import { IQuoter__factory } from '../typechain-types'
import { AlphaRouter, SwapOptionsSwapRouter02, SwapRoute, SwapType } from '@uniswap/smart-order-router'
import { BaseProvider, JsonRpcProvider } from '@ethersproject/providers'
export const STEP_TYPE_ID = 104
export const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
import { TradeType, CurrencyAmount, Percent, Token, Currency } from '@uniswap/sdk-core'
import Big from 'big.js'
import { BigNumber, utils } from 'ethers'
import { Protocol } from '@uniswap/router-sdk'
import { Memoize } from 'typescript-memoize'
import * as ethers from 'ethers'

// on ethereum:
// index 0 = USDT  = 0xdAC17F958D2ee523a2206206994597C13D831ec7
// index 1 = WBTC  = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
// index 2 = WETH  = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

// same address on all nets except celo
export const SWAP_ROUTER_ADDRESS = '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'

interface UniswapRoute {
  encodedPath: string
  portion: string
}

const UniswapRouteSchema = `
  tuple(
    bytes encodedPath,
    int256 portion
  )`

const UniswapExactInActionParamsSchema = `
  tuple(
    ${AssetSchema} toAsset,
    ${UniswapRouteSchema}[] routes,
    int256 minExchangeRate,
    int256 twoPointFive
  )`

const abiCoder = ethers.utils.defaultAbiCoder

export class UniswapExactInHelper extends AbstractStepHelper<UniswapExactIn> {
  async encodeWorkflowStep(context: EncodingContext<UniswapExactIn>): Promise<EncodedWorkflowStep> {
    const { chain, stepConfig } = context
    const { inputSymbol, outputSymbol, inputAmount } = stepConfig
    logger.debug('stepConfig', JSON.stringify(stepConfig, null, 2))

    const inputAssetAmount: AssetAmount = {
      asset: {
        type: 'fungible-token',
        symbol: inputSymbol,
      },
      amount: context.stepConfig.inputAmount,
    }

    const outputAsset: AssetReference = {
      type: 'fungible-token',
      symbol: outputSymbol,
    }

    const evmInputAmount = await sdkAssetAmountToEvmInputAmount(inputAssetAmount, chain, this.instance)
    const asset = await this.instance.dereferenceAsset(outputAsset, chain)
    const toAsset = sdkAssetToEvmAsset(asset, chain)
    const inputAmountStr = inputAmount.toString()
    const route = await this.getRoute(inputAssetAmount.asset, outputAsset, inputAmountStr)
    assert(route, "uniswap auto-router couldn't find a route")
    logger.debug('num routes', route.route.length)
    const routes = UniswapExactInHelper.encodeRoute(route)
    let slippageTolerancePct = stepConfig.slippageTolerance?.toString() || '100'
    if (slippageTolerancePct.endsWith('%')) {
      slippageTolerancePct = slippageTolerancePct.slice(0, -1)
    }
    const minExchangeRate = UniswapExactInHelper.getMinExchangeRate(inputAmountStr, route.quote, parseFloat(slippageTolerancePct))

    const twoPointFive = new Big(2.5)
    const twoPointFiveFloat = UniswapExactInHelper.toQuadFloat(twoPointFive)
    return {
      stepTypeId: STEP_TYPE_ID,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [evmInputAmount],
      argData: abiCoder.encode([UniswapExactInActionParamsSchema], [{ toAsset, routes, minExchangeRate, twoPointFive: twoPointFiveFloat }]),
    }
  }

  async getRoute(fromAssetRef: AssetReference, toAssetRef: AssetReference, amount?: string) {
    assert(typeof fromAssetRef === 'object' && typeof toAssetRef === 'object')
    assert(fromAssetRef.type === 'fungible-token')
    assert(toAssetRef.type === 'fungible-token')
    logger.debug(`getRoute(${fromAssetRef.symbol}, ${toAssetRef.symbol}, ${amount})`)

    const chainId = await this.getChainId()
    // if it's hardhat, assume it's forked ethereum during a test (auto router doesn't work with forks for some unknown reason)

    const chainIdForUniswap = chainId === 31337 ? 1 : chainId
    const chain = await this.getChain()

    const fromAsset = await this.instance.dereferenceAsset(fromAssetRef, chain)
    const toAsset = await this.instance.dereferenceAsset(toAssetRef, chain)
    assert(fromAsset.type === 'fungible-token')
    assert(toAsset.type === 'fungible-token')
    const fromAmount = amount ?? (await this.getTokenAmountInUsd(1000, fromAsset, chain))
    const uniswapFromToken = UniswapExactInHelper.toUniswapToken(chain, chainIdForUniswap, fromAsset)
    const uniswapToToken = UniswapExactInHelper.toUniswapToken(chain, chainIdForUniswap, toAsset)

    const router = this.getRouter(chainId)
    const options: SwapOptionsSwapRouter02 = {
      type: SwapType.SWAP_ROUTER_02,
      recipient: ADDRESS_ZERO,
      slippageTolerance: new Percent(1, 100),
      deadline: Math.floor(Date.now() / 1000 + 1800),
    }
    const route = await router.route(
      CurrencyAmount.fromRawAmount(uniswapFromToken, fromAmount),
      uniswapToToken,
      TradeType.EXACT_INPUT,
      options,
      { protocols: [Protocol.V3] }
    )
    return route
  }

  @Memoize()
  private getRouter(chainId: number) {
    logger.debug('getting router for chain', chainId)
    const chainIdForUniswap = chainId === 31337 ? 1 : chainId
    const mainNetUrl = 'https://mainnet.infura.io/v3/b3b072b551ea4092b120e69eb5f43993'
    // const mainNetUrl = 'https://rpc.ankr.com/eth'
    const provider = chainId === 31337 ? new JsonRpcProvider(mainNetUrl) : this.ethersProvider
    assert(provider)
    const router = new AlphaRouter({
      chainId: chainIdForUniswap,
      provider: provider as BaseProvider,
    })
    return router
  }

  static getMinExchangeRate(fromAmount: string, quote: CurrencyAmount<Currency>, slippageTolerancePct: number) {
    // console.log('quote', quote.numerator.toString(), quote.denominator.toString())
    const quoteNumerator = new Big(quote.numerator.toString())
    const quoteDenominator = new Big(quote.denominator.toString())
    const endAmount = quoteNumerator.div(quoteDenominator)
    const exchangeRate = endAmount.div(fromAmount)
    const worstExchangeRateDecimal = exchangeRate.mul(1 - slippageTolerancePct / 100)
    // make this into a 128.128 float
    return UniswapExactInHelper.toQuadFloat(worstExchangeRateDecimal)
  }

  static toQuadFloat(n: Big) {
    const nStr = n.toFixed()
    const dot = nStr.indexOf('.')
    const wholeNumberPart = dot === -1 ? nStr : nStr.slice(0, dot)
    logger.debug('wholeNumberPart', wholeNumberPart)

    const wholeNumberPartHex = BigNumber.from(wholeNumberPart).toHexString()
    logger.debug('wholeNumberPartHex', wholeNumberPartHex)
    // overflow would be > 32 hex digits, because the whole number part must fit inside 128 bits,
    // which is 16 bytes, which is 32 hex digits
    // but compare length to 34 to account for the leading 0x
    assert(wholeNumberPartHex.length <= 34, 'exchange rate overflow')
    // get the decimal part leaving in the decimal so we get it as a fraction
    const decimalPart = dot === -1 ? '0' : nStr.slice(dot)
    const decimalPartBig = new Big(decimalPart)
    // multiply the fraction by 2^128
    const twoToThe128 = new Big(2).pow(128)
    const decimalPart128 = twoToThe128.mul(decimalPartBig)
    const decimalPartHex = BigNumber.from(decimalPart128.toFixed(0)).toHexString()
    logger.debug('decimalPart', decimalPartHex, decimalPartHex.length)
    return utils.hexConcat([wholeNumberPartHex, decimalPartHex])
  }

  static encodeRoute(route: SwapRoute): UniswapRoute[] {
    const encodedPaths: UniswapRoute[] = []
    for (const route2 of route.route) {
      const amount = BigNumber.from(route2.amount.numerator.toString()).div(route2.amount.denominator.toString()).toString()
      const tokenPath = route2.tokenPath.map(it => it.address)
      let tokenPathIndex = 0
      assert(route2.route.protocol === Protocol.V3)
      let encodedPath = tokenPath[tokenPathIndex]
      for (const pool of route2.route.pools) {
        const fromToken = tokenPath[tokenPathIndex]
        assert(fromToken === pool.token0.address || fromToken === pool.token1.address)
        const toToken = tokenPath[tokenPathIndex + 1]
        assert(toToken === pool.token0.address || toToken === pool.token1.address)
        const feeHex = utils.hexlify(pool.fee)
        const paddedHexFee = utils.hexZeroPad(feeHex, 3).slice(2)
        logger.debug('paddedHexFee', paddedHexFee)
        encodedPath += paddedHexFee
        encodedPath += toToken.slice(2)
        ++tokenPathIndex
      }
      const portion = new Big(route2.percent).div(100)

      encodedPaths.push({
        encodedPath,
        portion: UniswapExactInHelper.toQuadFloat(portion),
      })
    }
    return encodedPaths
  }

  static toUniswapToken(chain: Chain, chainId: number, asset: Asset) {
    assert(asset.type === 'fungible-token')
    const assetChainInfo = asset.chains[chain]
    assert(assetChainInfo)

    return new Token(chainId, assetChainInfo.address, assetChainInfo.decimals)
  }

  async getTokenAmountInUsd(usdAmount: number, asset: Asset, chain: Chain) {
    assert(asset.type === 'fungible-token')
    const assetChainInfo = asset.chains[chain]
    assert(assetChainInfo)
    const oneToken = new Big(10).pow(assetChainInfo.decimals)
    if (!assetChainInfo.usd) {
      return oneToken.toFixed(0)
    }
    const oneDollarsWorthOfToken = oneToken.div(assetChainInfo.usd)
    return oneDollarsWorthOfToken.mul(usdAmount).toFixed(0)
  }
}
