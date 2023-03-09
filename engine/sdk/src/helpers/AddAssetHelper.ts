import { encodeAddAssetArgs, EvmWorkflowStep, StepIds } from '@freemarket/evm'
import type { EncodedWorkflowStep } from '../EncodedWorkflow'
import type { AddAsset, Chain } from '../model'
import type { IWorkflowRunner } from '../runner/IWorkflowRunner'
import assert from '../utils/assert'
import { sdkAssetToEvmAsset } from '../utils/evm-encoding-utils'
import { AbstractStepHelper } from './AbstractStepHelper'
import { ADDRESS_ZERO } from './utils'

export class AddAssetHelper extends AbstractStepHelper<AddAsset> {
  async getEncodedWorkflowStep(chain: Chain, stepConfig: AddAsset, runner: IWorkflowRunner): Promise<EncodedWorkflowStep> {
    assert(typeof stepConfig.asset !== 'string')
    const sdkAsset = await runner.dereferenceAsset(stepConfig.asset, chain)
    const evmAsset = sdkAssetToEvmAsset(sdkAsset, chain)

    const address = stepConfig.fromAddress ?? runner.getUserAddress()

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

    const evmStep: EvmWorkflowStep = {
      stepId: StepIds.addAsset,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [], // no input assets
      outputAssets: [evmAsset],
      data: encodeAddAssetArgs({
        fromAddress: address,
        amount: amountStr,
      }),
      nextStepIndex: 1,
    }
    return evmStep
  }
}
