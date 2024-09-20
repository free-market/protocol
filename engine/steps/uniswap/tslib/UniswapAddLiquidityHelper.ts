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
  EvmAsset,
  Chain,
} from '@freemarket/core'
import { AssetSchema } from '@freemarket/step-sdk'
import type { UniswapAddLiquidity, UniswapExactIn } from './model'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import Big from 'big.js'
import { defaultAbiCoder } from '@ethersproject/abi'
import { UniswapBaseHelper, UniswapRouteSchema } from './UniswapBaseHelper'
import { STEP_TYPE_ID_UNISWAP_EXACT_IN } from '@freemarket/core/tslib/step-ids'


const UniswapAddLiquidityParams = `
  tuple(
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
  )`

// function logQuote(message: string, quote: CurrencyAmount<Currency>) {
//   const nBig = new Big(quote.numerator.toString())
//   const dBig = new Big(quote.denominator.toString())
//   const decimal = nBig.div(dBig)
//   // prettier-ignore
//   logger.debug(`${message} numerator=${quote.numerator.toString()} denominator=${quote.denominator.toString()} decimalScale=${quote.decimalScale.toString()} decimal=${decimal.toFixed(5)} toFixed=${quote.toFixed(5)}`)
// }

export class UniswapAddLiquidityHelper extends UniswapBaseHelper<UniswapAddLiquidity> {
  async encodeWorkflowStep(context: EncodingContext<UniswapAddLiquidity>): Promise<EncodedWorkflowStep> {
    const { chain, stepConfig } = context
    logger.debug('stepConfig', JSON.stringify(stepConfig, null, 2))
    
    // input and amount
    const evmInputAmount0 = await sdkAssetAndAmountToEvmInputAmount(
      context.stepConfig.inputAsset0,
      context.stepConfig.amount0Desired,
      context.chain,
      this.instance,
      context.stepConfig.inputAssetSource === 'caller'
    )

    const evmInputAmount1 = await sdkAssetAndAmountToEvmInputAmount(
      context.stepConfig.inputAsset1,
      context.stepConfig.amount1Desired,
      context.chain,
      this.instance,
      context.stepConfig.inputAssetSource === 'caller'
    )
    const fee = await this.getUniswapFee(context.chain, evmInputAmount0.asset, evmInputAmount1.asset)

    return {
      stepTypeId: STEP_TYPE_ID_UNISWAP_EXACT_IN,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [evmInputAmount0, evmInputAmount1],
      argData: defaultAbiCoder.encode([UniswapAddLiquidityParams], [{
        fee,
        tickUpper: stepConfig.tickUpper,
        tickLower: stepConfig.tickLower,
        amount0Min: stepConfig.amount0Min,
        amount1Min: stepConfig.amount1Min,
        deadline: stepConfig.deadline.getTime()/1000
       }]),
    }
  }

  /*
  Uniswap v3 allows for multiple pools of (token0, token1) with different fees
  
  TODO update with actual uniswap fees deployed
  */
  async getUniswapFee(chain: Chain, token0 : EvmAsset, token1 : EvmAsset) : Promise<number> {
    return 30000
  }

}
