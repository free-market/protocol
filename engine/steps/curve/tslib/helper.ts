import { EncodingContext, EncodedWorkflowStep, sdkAssetAmountToEvmInputAmount, assert, ADDRESS_ZERO } from '@freemarket/core'
import { AbstractStepHelper } from '@freemarket/step-sdk'
import type { CurveTriCrypto2Swap } from './model'

export const STEP_TYPE_ID = 103

// on ethereum:
// index 0 = USDT  = 0xdAC17F958D2ee523a2206206994597C13D831ec7
// index 1 = WBTC  = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
// index 2 = WETH  = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

export class CurveTriCrypto2SwapHelper extends AbstractStepHelper<CurveTriCrypto2Swap> {
  async encodeWorkflowStep(context: EncodingContext<CurveTriCrypto2Swap>): Promise<EncodedWorkflowStep> {
    assert(typeof context.stepConfig.inputAsset !== 'string')
    const inputAsset = await sdkAssetAmountToEvmInputAmount(context.stepConfig.inputAsset, context.chain, this.instance)
    // TODO implement me
    return {
      stepId: STEP_TYPE_ID,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [],
      outputAssets: [],
      data: '0x',
    }
  }
}
