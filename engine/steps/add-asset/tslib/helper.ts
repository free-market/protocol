import { AbstractStepHelper } from '@freemarket/step-sdk'
import { defaultAbiCoder } from '@ethersproject/abi'
import {
  addressSchema,
  amountSchema,
  assetReferenceSchema,
  createStepSchema,
  ADDRESS_ZERO,
  assert,
  EncodedWorkflowStep,
  EncodingContext,
  sdkAssetToEvmAsset,
  EvmAssetAmount,
  EvmAssetType,
  EvmInputAsset,
} from '@freemarket/core'
import type z from 'zod'
import { AddAsset } from './model'

export const STEP_TYPE_ID_ADD_ASSET = 100

export class AddAssetHelper extends AbstractStepHelper<AddAsset> {
  async encodeWorkflowStep(context: EncodingContext<AddAsset>): Promise<EncodedWorkflowStep> {
    const { stepConfig, chain } = context
    assert(typeof stepConfig.asset !== 'string')
    const sdkAsset = await this.instance.dereferenceAsset(stepConfig.asset, chain)
    const evmAsset = sdkAssetToEvmAsset(sdkAsset, chain)

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

    const evmAssetAmount: EvmInputAsset = {
      asset: evmAsset,
      amount: amountStr,
      amountIsPercent: false,
      sourceIsCaller: false,
    }

    return {
      stepTypeId: STEP_TYPE_ID_ADD_ASSET,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [evmAssetAmount],
      argData: '0x',
    }
  }
}
