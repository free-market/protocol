import { AbstractStepHelper } from '@freemarket/step-sdk'
import type {
  EncodedWorkflowStep,
  EncodingContext,
  EvmInputAsset} from '@freemarket/core';
import {
  ADDRESS_ZERO,
  assert,
  sdkAssetToEvmAsset,
  TEN_BIG,
  decimalStringSchema,
} from '@freemarket/core'
import Big from 'big.js'
import type { AddAsset } from './model'

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
      if (!decimalStringSchema.safeParse(stepConfig.amount).success) {
        throw new Error(`only absolute amounts are supported: json=${stepConfig.amount} evm=${evmAsset.assetType}`)
      }
      amountStr = stepConfig.amount
    }

    let amountBig = new Big(amountStr)
    const decimals = sdkAsset.type === 'native' ? 18 : sdkAsset.chains[context.chain]?.decimals ?? 0
    amountBig = amountBig.mul(TEN_BIG.pow(decimals))

    const evmAssetAmount: EvmInputAsset = {
      asset: evmAsset,
      amount: amountBig.toFixed(0),
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
