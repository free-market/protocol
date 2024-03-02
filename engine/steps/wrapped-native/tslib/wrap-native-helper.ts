import type { EncodingContext, EncodedWorkflowStep, AssetAmount } from '@freemarket/core';
import { sdkAssetAmountToEvmInputAmount } from '@freemarket/core'
import { AbstractStepHelper } from '@freemarket/step-sdk'
import type { WrapNative } from './model'

export const STEP_TYPE_ID_WRAP_NATIVE = 105

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
      stepTypeId: STEP_TYPE_ID_WRAP_NATIVE,
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
