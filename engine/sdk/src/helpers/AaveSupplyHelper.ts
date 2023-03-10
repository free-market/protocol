import { AssetType, StepIds } from '@freemarket/evm'
import type { EncodedWorkflowStep } from '../EncodedWorkflow'
import type { AaveSupply, Chain, StargateBridge } from '../model'
import type { IWorkflowRunner } from '../runner/IWorkflowRunner'
import assert from '../utils/assert'
import { sdkAssetAmountToEvmInputAmount } from '../utils/evm-encoding-utils'

import { AbstractStepHelper } from './AbstractStepHelper'
import { ADDRESS_ZERO } from './utils'

export class AaveSupplyHelper extends AbstractStepHelper<AaveSupply> {
  async encodeWorkflowStep(chain: Chain, stepConfig: AaveSupply): Promise<EncodedWorkflowStep> {
    assert(typeof stepConfig.inputAsset !== 'string')
    const inputAsset = await sdkAssetAmountToEvmInputAmount(stepConfig.inputAsset, chain, this.runner)
    return {
      stepId: StepIds.aaveSupply,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [inputAsset],
      outputAssets: [],
      data: '0x',
    }
  }
}
