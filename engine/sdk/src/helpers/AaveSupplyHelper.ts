import { StepIds } from '@freemarket/evm'
import type { EncodedWorkflowStep } from '../EncodedWorkflow'
import type { AaveSupply } from '../model'
import assert from '../utils/assert'
import { sdkAssetAmountToEvmInputAmount } from '../utils/evm-utils'

import { AbstractStepHelper } from './AbstractStepHelper'
import type { EncodingContext } from './IStepHelper'
import { ADDRESS_ZERO } from './utils'

export class AaveSupplyHelper extends AbstractStepHelper<AaveSupply> {
  async encodeWorkflowStep(context: EncodingContext<AaveSupply>): Promise<EncodedWorkflowStep> {
    assert(typeof context.stepConfig.inputAsset !== 'string')
    const inputAsset = await sdkAssetAmountToEvmInputAmount(context.stepConfig.inputAsset, context.chain, this.instance)
    return {
      stepId: StepIds.aaveSupply,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [inputAsset],
      outputAssets: [],
      data: '0x',
    }
  }
}
