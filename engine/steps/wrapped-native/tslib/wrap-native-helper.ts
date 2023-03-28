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
} from '@freemarket/core'
import { AbstractStepHelper } from '@freemarket/step-sdk'
import type { WrapNative } from './model'

export const STEP_TYPE_ID = 105

export class WrapNativeHelper extends AbstractStepHelper<WrapNative> {
  async encodeWorkflowStep(context: EncodingContext<WrapNative>): Promise<EncodedWorkflowStep> {
    const { chain } = context
    const inputAssetAmount: AssetAmount = {
      asset: {
        type: 'native',
      },
      amount: context.stepConfig.amount,
    }

    const evmInputAmount = await sdkAssetAmountToEvmInputAmount(inputAssetAmount, chain, this.instance)

    return {
      stepTypeId: STEP_TYPE_ID,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [evmInputAmount],
      outputAssets: [],
      data: '0x',
    }
  }
}
