import {
  EncodingContext,
  EncodedWorkflowStep,
  sdkAssetAmountToEvmInputAmount,
  assert,
  ADDRESS_ZERO,
  AssetAmount,
  AssetReference,
  sdkAssetToEvmAsset,
  EvmAsset,
} from '@freemarket/core'
import { AbstractStepHelper, AssetSchema } from '@freemarket/step-sdk'
import type { CurveTriCrypto2Swap } from './model'
import { defaultAbiCoder } from '@ethersproject/abi'

export const STEP_TYPE_ID = 103

// on ethereum:
// index 0 = USDT  = 0xdAC17F958D2ee523a2206206994597C13D831ec7
// index 1 = WBTC  = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
// index 2 = WETH  = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

export class CurveTriCrypto2SwapHelper extends AbstractStepHelper<CurveTriCrypto2Swap> {
  async encodeWorkflowStep(context: EncodingContext<CurveTriCrypto2Swap>): Promise<EncodedWorkflowStep> {
    const { chain, stepConfig } = context
    const { inputAsset, outputAsset, inputAmount } = stepConfig

    const inputAssetAmount: AssetAmount = {
      asset: inputAsset,
      amount: context.stepConfig.inputAmount,
    }

    const evmInputAmount = await sdkAssetAmountToEvmInputAmount(inputAssetAmount, chain, this.instance)
    const asset = await this.instance.dereferenceAsset(outputAsset, chain)
    const toAsset = sdkAssetToEvmAsset(asset, chain)

    return {
      stepTypeId: STEP_TYPE_ID,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [evmInputAmount],
      argData: CurveTriCrypto2SwapHelper.encodeAddAssetArgs(toAsset),
    }
  }

  private static encodeAddAssetArgs(toAsset: EvmAsset) {
    const encodedArgs = defaultAbiCoder.encode(
      [
        `tuple(
          ${AssetSchema} toAsset
         )`,
      ],
      [{ toAsset }]
    )
    return encodedArgs
  }
  getAddAssetInfo(stepConfig: CurveTriCrypto2Swap): Promise<AssetAmount[]> {
    const ret: AssetAmount[] = []
    assert(typeof stepConfig.inputAsset !== 'string')
    if (stepConfig.inputAsset.source === 'caller') {
      ret.push({
        asset: stepConfig.inputAsset,
        amount: stepConfig.inputAmount,
      })
    }
    return Promise.resolve(ret)
  }
}
