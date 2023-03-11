import { encodeAddAssetArgs, StepIds } from '@freemarket/evm'
import type { EncodedWorkflowStep } from '../EncodedWorkflow'
import type { AddAsset, Chain } from '../model'
import assert from '../utils/assert'
import { sdkAssetToEvmAsset } from '../utils/evm-encoding-utils'
import { AbstractStepHelper } from './AbstractStepHelper'
import { ADDRESS_ZERO } from './utils'

export class AddAssetHelper extends AbstractStepHelper<AddAsset> {
  async encodeWorkflowStep(chain: Chain, stepConfig: AddAsset): Promise<EncodedWorkflowStep> {
    assert(typeof stepConfig.asset !== 'string')
    const sdkAsset = await this.runner.dereferenceAsset(stepConfig.asset, chain)
    const evmAsset = sdkAssetToEvmAsset(sdkAsset, chain)

    const address = stepConfig.fromAddress ?? this.runner.getUserAddress()

    // TODO CORE-16 support percentages
    let amountStr: string
    if (typeof stepConfig.amount === 'number') {
      amountStr = stepConfig.amount.toFixed(0)
    } else if (typeof stepConfig.amount === 'bigint') {
      amountStr = stepConfig.amount.toString()
    } else {
      if (!/^\d+$/.test(stepConfig.amount)) {
        throw new Error('only absolute amounts are supported')
      }
      amountStr = stepConfig.amount
    }

    return {
      stepId: StepIds.addAsset,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [], // no input assets
      outputAssets: [evmAsset],
      data: encodeAddAssetArgs({
        fromAddress: address,
        amount: amountStr,
      }),
    }
  }
}
