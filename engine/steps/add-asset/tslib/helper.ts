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
} from '@freemarket/core'
import type z from 'zod'

export const STEP_TYPE_ID = 100

export const addAssetSchema = createStepSchema('add-asset')
  .extend({
    asset: assetReferenceSchema.describe('asset to be added to the workflow'),
    amount: amountSchema.describe('amount of asset to be added to the workflow'),
    fromAddress: addressSchema.optional().describe('the address from which the asset will be transferred'),
  })
  .describe('Adds an asset to the workflow.')

export interface AddAsset extends z.infer<typeof addAssetSchema> {}

export class AddAssetHelper extends AbstractStepHelper<AddAsset> {
  async encodeWorkflowStep(context: EncodingContext<AddAsset>): Promise<EncodedWorkflowStep> {
    const { stepConfig, chain } = context
    assert(typeof stepConfig.asset !== 'string')
    const sdkAsset = await this.instance.dereferenceAsset(stepConfig.asset, chain)
    const evmAsset = sdkAssetToEvmAsset(sdkAsset, chain)

    const address = stepConfig.fromAddress ?? context.userAddress

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
      stepId: STEP_TYPE_ID,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [], // no input assets
      outputAssets: [evmAsset],
      data: AddAssetHelper.encodeAddAssetArgs(address, amountStr),
    }
  }
  static encodeAddAssetArgs(fromAddress: string, amount: string) {
    const encodedArgs = defaultAbiCoder.encode(
      [
        `tuple(
           address fromAddress,
           uint256 amount
         )`,
      ],
      [{ fromAddress, amount }]
    )
    return encodedArgs
  }
}
