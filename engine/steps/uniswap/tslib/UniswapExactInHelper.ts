import rootLogger from 'loglevel'
rootLogger.setLevel('debug')
const logger = rootLogger.getLogger('UniswapExactInHelper')
import {
  EncodingContext,
  EncodedWorkflowStep,
  sdkAssetAndAmountToEvmInputAmount,
  assert,
  ADDRESS_ZERO,
  AssetAmount,
  sdkAssetToEvmAsset,
} from '@freemarket/core'
import { AssetSchema } from '@freemarket/step-sdk'
import type { UniswapExactIn } from './model'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import Big from 'big.js'
import { defaultAbiCoder } from '@ethersproject/abi'
import { UniswapBaseHelper, UniswapRouteSchema } from './UniswapBaseHelper'
import { STEP_TYPE_ID_UNISWAP_EXACT_IN } from '@freemarket/core/tslib/step-ids'

const UniswapExactInActionParamsSchema = `
  tuple(
    ${AssetSchema} toAsset,
    ${UniswapRouteSchema}[] routes,
    int256 worstExchangeRate
  )`

// function logQuote(message: string, quote: CurrencyAmount<Currency>) {
//   const nBig = new Big(quote.numerator.toString())
//   const dBig = new Big(quote.denominator.toString())
//   const decimal = nBig.div(dBig)
//   // prettier-ignore
//   logger.debug(`${message} numerator=${quote.numerator.toString()} denominator=${quote.denominator.toString()} decimalScale=${quote.decimalScale.toString()} decimal=${decimal.toFixed(5)} toFixed=${quote.toFixed(5)}`)
// }

export class UniswapExactInHelper extends UniswapBaseHelper<UniswapExactIn> {
  async encodeWorkflowStep(context: EncodingContext<UniswapExactIn>): Promise<EncodedWorkflowStep> {
    const { chain, stepConfig } = context
    logger.debug('stepConfig', JSON.stringify(stepConfig, null, 2))

    // input and amount
    const evmInputAmount = await sdkAssetAndAmountToEvmInputAmount(
      context.stepConfig.inputAsset,
      context.stepConfig.inputAmount,
      context.chain,
      this.instance,
      context.stepConfig.inputAssetSource === 'caller'
    )

    const outputAsset = await this.instance.dereferenceAsset(context.stepConfig.outputAsset, context.chain)

    // const toAsset = await this.instance.dereferenceAsset(outputAsset, chain)
    const evmOutputAsset = sdkAssetToEvmAsset(outputAsset, chain)

    // use uniswap SDK to get the route, then encode it
    const inputAmountStr = context.stepConfig.inputAmount.toString()
    const { route, amountUsedForRoute } = await this.getRoute(context.stepConfig.inputAsset, outputAsset, 'exactIn', inputAmountStr)
    assert(route, "uniswap auto-router couldn't find a route")
    // logger.debug('uniswap route', JSON.stringify(route, null, 2))
    // logQuote('top level quote', route.quote)
    // logQuote('top level quoteGasAdjusted', route.quoteGasAdjusted)
    logger.debug('uniswap num routes', route.route.length)
    const routes = UniswapBaseHelper.encodeRoute(route)

    // encode slippage tolerance
    let slippageTolerancePct = stepConfig.slippageTolerance?.toString() || '100'
    if (slippageTolerancePct.endsWith('%')) {
      slippageTolerancePct = slippageTolerancePct.slice(0, -1)
    }
    // compute minExchangeRate, which is a percentage of the input amount minus the slippage tolerance
    const worstExchangeRate = UniswapExactInHelper.getWorstExchangeRate(amountUsedForRoute, route.quote, parseFloat(slippageTolerancePct))
    return {
      stepTypeId: STEP_TYPE_ID_UNISWAP_EXACT_IN,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [evmInputAmount],
      argData: defaultAbiCoder.encode([UniswapExactInActionParamsSchema], [{ toAsset: evmOutputAsset, routes, worstExchangeRate }]),
    }
  }

  static getWorstExchangeRate(fromAmount: string, quote: CurrencyAmount<Currency>, slippageTolerancePct: number) {
    logger.debug('fromAmount for getMinExchangeRate', fromAmount)
    logger.debug('slippageTolerancePct', slippageTolerancePct)
    logger.debug('quote', quote.numerator.toString(), quote.denominator.toString())
    const fromAmountBig = new Big(fromAmount)
    const quoteNumerator = new Big(quote.numerator.toString())
    const quoteDenominator = new Big(quote.denominator.toString())
    const quoteAmount = quoteNumerator.div(quoteDenominator)
    const exchangeRate = quoteAmount.div(fromAmountBig)
    logger.debug('exchange rate', exchangeRate.toFixed(10))
    const worstExchangeRateDecimal = exchangeRate.mul(1 - slippageTolerancePct / 100)
    logger.debug('worst exchange rate', worstExchangeRateDecimal.toFixed(10))
    logger.debug('worst amount out', fromAmountBig.mul(worstExchangeRateDecimal).toFixed(4))
    // make this into a 128.128 float
    return this.to128x128(worstExchangeRateDecimal)
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
