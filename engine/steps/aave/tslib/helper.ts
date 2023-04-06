import { EncodingContext, EncodedWorkflowStep, sdkAssetAmountToEvmInputAmount, assert, ADDRESS_ZERO } from '@freemarket/core'
import { AbstractStepHelper } from '@freemarket/step-sdk'
import type { AaveSupply } from './model'

export const STEP_TYPE_ID = 102

export class AaveSupplyHelper extends AbstractStepHelper<AaveSupply> {
  async encodeWorkflowStep(context: EncodingContext<AaveSupply>): Promise<EncodedWorkflowStep> {
    assert(typeof context.stepConfig.inputAsset !== 'string')
    const inputAsset = await sdkAssetAmountToEvmInputAmount(context.stepConfig.inputAsset, context.chain, this.instance)
    return {
      stepTypeId: STEP_TYPE_ID,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [inputAsset],
      argData: '0x',
    }
  }
}
