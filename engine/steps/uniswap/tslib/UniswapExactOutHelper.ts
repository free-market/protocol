import rootLogger from 'loglevel'
const logger = rootLogger.getLogger('UniswapExactOutHelper')

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
import type { UniswapExactOut } from './model'
export const STEP_TYPE_ID_UNISWAP_EXACT_OUT = 109
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import Big from 'big.js'
import { defaultAbiCoder } from '@ethersproject/abi'
import { UniswapBaseHelper, UniswapRouteSchema } from './UniswapBaseHelper'

const UniswapExactOutActionParamsSchema = `
  tuple(
    ${AssetSchema} fromAsset,
    ${AssetSchema} toAsset,
    uint256 amountOut,
    ${UniswapRouteSchema}[] routes,
    int256 worstExchangeRate
  )`

export class UniswapExactOutHelper extends UniswapBaseHelper<UniswapExactOut> {
  async encodeWorkflowStep(context: EncodingContext<UniswapExactOut>): Promise<EncodedWorkflowStep> {
    const { chain, stepConfig } = context
    logger.debug('stepConfig', JSON.stringify(stepConfig, null, 2))

    // // input and amount
    // const evmInputAmount = await sdkAssetAndAmountToEvmInputAmount(
    //   context.stepConfig.inputAsset,
    //   context.stepConfig.inputAmount,
    //   context.chain,
    //   this.instance,
    //   context.stepConfig.inputAssetSource === 'caller'
    // )

    const inputAsset = await this.instance.dereferenceAsset(context.stepConfig.inputAsset, context.chain)
    const outputAsset = await this.instance.dereferenceAsset(context.stepConfig.outputAsset, context.chain)

    const evmInputAsset = sdkAssetToEvmAsset(inputAsset, chain)
    const evmOutputAssetAmount = await sdkAssetAndAmountToEvmInputAmount(outputAsset, stepConfig.outputAmount, chain, this.instance, false)
    const evmOutputAsset = evmOutputAssetAmount.asset

    // use uniswap SDK to get the route, then encode it
    const inputAmountStr = context.stepConfig.outputAmount.toString()
    const { route, amountUsedForRoute } = await this.getRoute(context.stepConfig.inputAsset, outputAsset, 'exactOut', inputAmountStr)
    logger.debug('amountUsedForRoute', amountUsedForRoute.toString())
    assert(route, "uniswap auto-router couldn't find a route")
    logger.debug('uniswap num routes', route.route.length)
    const routes = UniswapBaseHelper.encodeRoute(route)

    // compute minExchangeRate, which is a percentage of the input amount minus the slippage tolerance
    const slippageTolerancePct = UniswapExactOutHelper.getSlippageTolerancePercent(stepConfig.slippageTolerance)
    const worstExchangeRate = UniswapExactOutHelper.getWorstExchangeRate(amountUsedForRoute, route.quote, slippageTolerancePct)
    return {
      stepTypeId: STEP_TYPE_ID_UNISWAP_EXACT_OUT,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [],
      argData: defaultAbiCoder.encode(
        [UniswapExactOutActionParamsSchema],
        [
          {
            fromAsset: evmInputAsset,
            toAsset: evmOutputAsset,
            amountOut: evmOutputAssetAmount.amount.toString(),
            routes,
            worstExchangeRate,
          },
        ]
      ),
    }
  }

  static getWorstExchangeRate(toAmount: string, quote: CurrencyAmount<Currency>, slippageTolerancePct: number) {
    logger.debug('quote', JSON.stringify(quote, null, 2))

    const quoteNumerator = new Big(quote.numerator.toString())
    const quoteDenominator = new Big(quote.denominator.toString())
    const fromAmount = quoteNumerator.div(quoteDenominator)
    const exchangeRate = new Big(toAmount).div(fromAmount)
    logger.debug('exchangeRate', exchangeRate.toString())

    // exact out swaps the _minimum_ amount of input for the output,
    // so the tolerable exchange rate is the predicted exchange rate plus the slippage tolerance
    const worstExchangeRate = exchangeRate.mul(1 + slippageTolerancePct / 100)
    logger.debug('worstExchangeRate', worstExchangeRate.toString())
    // make this into a 128.128 float
    const ret = this.to128x128(worstExchangeRate)
    logger.debug('worstExchangeRate encoded', ret)
    const retDecimal = BigInt(ret)
    logger.debug('worstExchangeRate encoded decimal', retDecimal.toString())
    return ret
  }
}
