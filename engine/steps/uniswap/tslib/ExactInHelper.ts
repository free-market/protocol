import rootLogger from 'loglevel'
const logger = rootLogger.getLogger('UniswapExactInHelper')

import {
  EncodingContext,
  EncodedWorkflowStep,
  sdkAssetAmountToEvmInputAmount,
  sdkAssetAndAmountToEvmInputAmount,
  assert,
  ADDRESS_ZERO,
  AssetAmount,
  Asset,
  sdkAssetToEvmAsset,
  AssetReference,
  Chain,
  getEthersProvider,
} from '@freemarket/core'
import { AbstractStepHelper, AssetSchema } from '@freemarket/step-sdk'
import type { UniswapExactIn } from './model'
// import { IQuoter__factory } from '../typechain-types'
import { AlphaRouter, SwapOptionsSwapRouter02, SwapRoute, SwapType } from '@uniswap/smart-order-router'
import { BaseProvider, JsonRpcProvider } from '@ethersproject/providers'
export const STEP_TYPE_ID_UNISWAP_EXACT_IN = 104
export const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
import { TradeType, CurrencyAmount, Percent, Token, Currency } from '@uniswap/sdk-core'
import Big from 'big.js'
import { BigNumber, utils } from 'ethers'
import { Protocol } from '@uniswap/router-sdk'
import { Memoize } from 'typescript-memoize'
import * as ethers from 'ethers'
import { UniswapBaseHelper } from './UniswapBaseHelper'

// on ethereum:
// index 0 = USDT  = 0xdAC17F958D2ee523a2206206994597C13D831ec7
// index 1 = WBTC  = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
// index 2 = WETH  = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

// same address on all nets except celo
export const SWAP_ROUTER_ADDRESS = '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'


const UniswapRouteSchema = `
  tuple(
    bytes encodedPath,
    int256 portion
  )`

const UniswapExactInActionParamsSchema = `
  tuple(
    ${AssetSchema} toAsset,
    ${UniswapRouteSchema}[] routes,
    int256 minExchangeRate
  )`

const abiCoder = ethers.utils.defaultAbiCoder

export class UniswapExactInHelper extends UniswapBaseHelper<UniswapExactIn> {
  async encodeWorkflowStep(context: EncodingContext<UniswapExactIn>): Promise<EncodedWorkflowStep> {
    const { chain, stepConfig } = context

    logger.debug('stepConfig', JSON.stringify(stepConfig, null, 2))

    const evmInputAmount = await sdkAssetAndAmountToEvmInputAmount(
      context.stepConfig.inputAsset,
      context.stepConfig.inputAmount,
      context.chain,
      this.instance,
      context.stepConfig.inputAssetSource === 'caller'
    )

    const outputAsset = await this.instance.dereferenceAsset(context.stepConfig.outputAsset, context.chain)

    const asset = await this.instance.dereferenceAsset(outputAsset, chain)
    const toAsset = sdkAssetToEvmAsset(asset, chain)
    const inputAmountStr = context.stepConfig.inputAmount.toString()
    const route = await this.getRoute(context.stepConfig.inputAsset, outputAsset, 'exactIn', inputAmountStr)
    assert(route, "uniswap auto-router couldn't find a route")
    logger.debug('num routes', route.route.length)
    const routes = UniswapExactInHelper.encodeRoute(route)
    let slippageTolerancePct = stepConfig.slippageTolerance?.toString() || '100'
    if (slippageTolerancePct.endsWith('%')) {
      slippageTolerancePct = slippageTolerancePct.slice(0, -1)
    }
    const minExchangeRate = UniswapExactInHelper.getMinExchangeRate(inputAmountStr, route.quote, parseFloat(slippageTolerancePct))

    return {
      stepTypeId: STEP_TYPE_ID_UNISWAP_EXACT_IN,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [evmInputAmount],
      argData: abiCoder.encode([UniswapExactInActionParamsSchema], [{ toAsset, routes, minExchangeRate }]),
    }
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



  getAddAssetInfo(stepConfig: UniswapExactIn): Promise<AssetAmount[]> {
    assert(typeof stepConfig.inputAsset !== 'string')
    if (stepConfig.inputAssetSource === 'caller') {
      return Promise.resolve([
        {
          asset: stepConfig.inputAsset,
          amount: stepConfig.inputAmount,
        },
      ])
    }
    return Promise.resolve([])
  }
}
