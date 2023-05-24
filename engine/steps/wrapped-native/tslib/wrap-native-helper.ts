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

export const WRAP_NATIVE_STEP_TYPE_ID = 105

export class WrapNativeHelper extends AbstractStepHelper<WrapNative> {
  async encodeWorkflowStep(context: EncodingContext<WrapNative>): Promise<EncodedWorkflowStep> {
    const { chain } = context
    const inputAssetAmount: AssetAmount = {
      asset: {
        type: 'native',
      },
      amount: context.stepConfig.amount,
    }

    const evmInputAmount = await sdkAssetAmountToEvmInputAmount(
      inputAssetAmount,
      chain,
      this.instance,
      context.stepConfig.source === 'caller'
    )

    return {
      stepTypeId: WRAP_NATIVE_STEP_TYPE_ID,
      stepAddress: this.getStepAddress(context),
      inputAssets: [evmInputAmount],
      argData: '0x',
    }
  }
  getAddAssetInfo(stepConfig: WrapNative): Promise<AssetAmount[]> {
    const ret: AssetAmount[] = []
    if (stepConfig.source === 'caller') {
      ret.push({
        asset: { type: 'native' },
        amount: stepConfig.amount,
      })
    }
    return Promise.resolve(ret)
  }
}
