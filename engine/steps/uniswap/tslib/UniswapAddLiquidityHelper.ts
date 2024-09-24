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
import type { UniswapAddLiquidity } from './model'
import { defaultAbiCoder } from '@ethersproject/abi'
import { UniswapBaseHelper } from './UniswapBaseHelper'
import { STEP_TYPE_ID_UNISWAP_ADD_LIQUIDITY } from '@freemarket/core/tslib/step-ids'


const UniswapAddLiquidityParams = `
  tuple(
        uint24 fee,
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0Min,
        uint256 amount1Min,
        uint256 deadline
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
    const [fee, tickSpacing] = await this.getUniswapFeeAndTickSpacing(context.chain, evmInputAmount0.asset, evmInputAmount1.asset)

    return {
      stepTypeId: STEP_TYPE_ID_UNISWAP_ADD_LIQUIDITY,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [evmInputAmount0, evmInputAmount1],
      argData: defaultAbiCoder.encode([UniswapAddLiquidityParams], [{
        fee,
        tickUpper: stepConfig.tickUpper,
        tickLower: stepConfig.tickLower,
        amount0Min: stepConfig.amount0Min,
        amount1Min: stepConfig.amount1Min,
        deadline: Math.floor(stepConfig.deadline.getTime()/1000)
       }]),
    }
  }

  /*
  Uniswap v3 allows for multiple pools of (token0, token1) with different fees
  
  TODO update with actual uniswap fees deployed

  see https://blog.uniswap.org/uniswap-v3-math-primer
  

  tick spacing dependant on fee:
  fee ts
  100  1
  500  10
  3000 60
  10000  200
  */
  async getUniswapFeeAndTickSpacing(chain: Chain, token0 : EvmAsset, token1 : EvmAsset) : Promise<[number, number]> {
    return [3000, 60]
  }

}
