import { EncodingContext, EncodedWorkflowStep, sdkAssetAmountToEvmInputAmount, AssetAmount } from '@freemarket/core'
import { AbstractStepHelper } from '@freemarket/step-sdk'
import type { UnwrapNative } from './model'
import { STEP_TYPE_ID_UNWRAP_NATIVE } from '../../step-ids'

export class UnwrapNativeHelper extends AbstractStepHelper<UnwrapNative> {
  async encodeWorkflowStep(context: EncodingContext<UnwrapNative>): Promise<EncodedWorkflowStep> {
    const { chain } = context
    const inputAssetAmount: AssetAmount = {
      asset: {
        type: 'fungible-token',
        symbol: 'WETH',
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
      stepTypeId: STEP_TYPE_ID_UNWRAP_NATIVE,
      stepAddress: this.getStepAddress(context),
      inputAssets: [evmInputAmount],
      argData: '0x',
    }
  }
  getAddAssetInfo(stepConfig: UnwrapNative): Promise<AssetAmount[]> {
    const ret: AssetAmount[] = []
    if (stepConfig.source === 'caller') {
      ret.push({
        asset: { type: 'fungible-token', symbol: 'WETH' },
        amount: stepConfig.amount,
      })
    }
    return Promise.resolve(ret)
  }
}
