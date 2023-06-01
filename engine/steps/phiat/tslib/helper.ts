import {
  EncodingContext,
  EncodedWorkflowStep,
  sdkAssetAmountToEvmInputAmount,
  assert,
  ADDRESS_ZERO,
  sdkAssetAndAmountToEvmInputAmount,
  AssetAmount,
} from '@freemarket/core'
import { AbstractStepHelper } from '@freemarket/step-sdk'
import type { PhiatSupply } from './model'

export const STEP_TYPE_ID_PHIAT_SUPPLY = 108

export class PhiatSupplyHelper extends AbstractStepHelper<PhiatSupply> {
  async encodeWorkflowStep(context: EncodingContext<PhiatSupply>): Promise<EncodedWorkflowStep> {
    assert(typeof context.stepConfig.asset !== 'string')
    const inputAsset = await sdkAssetAndAmountToEvmInputAmount(
      context.stepConfig.asset,
      context.stepConfig.amount,
      context.chain,
      this.instance,
      context.stepConfig.source === 'caller'
    )
    return {
      stepTypeId: STEP_TYPE_ID_PHIAT_SUPPLY,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [inputAsset],
      argData: '0x',
    }
  }
  getAddAssetInfo(stepConfig: PhiatSupply): Promise<AssetAmount[]> {
    const ret: AssetAmount[] = []
    assert(typeof stepConfig.asset !== 'string')
    if (stepConfig.source === 'caller') {
      ret.push({
        asset: stepConfig.asset,
        amount: stepConfig.amount,
      })
    }
    return Promise.resolve(ret)
  }
}
