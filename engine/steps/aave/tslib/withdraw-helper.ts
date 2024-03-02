import type { EncodingContext, EncodedWorkflowStep, AssetReference, AssetAmount } from '@freemarket/core'
import { assert, ADDRESS_ZERO, sdkAssetToEvmAsset, sdkAssetAndAmountToEvmInputAmount } from '@freemarket/core'
import { AbstractStepHelper, AssetSchema } from '@freemarket/step-sdk'
import type { AaveWithdraw } from './model'
import { defaultAbiCoder } from '@ethersproject/abi'

export const STEP_TYPE_ID_AAVE_WITHDRAW = 112

const abi = `
tuple(
  ${AssetSchema} asset,
  uint256 amountToWithdraw,
  bool amountIsPercent
)
`

export class AaveWithdrawHelper extends AbstractStepHelper<AaveWithdraw> {
  async encodeWorkflowStep(context: EncodingContext<AaveWithdraw>): Promise<EncodedWorkflowStep> {
    assert(typeof context.stepConfig.asset !== 'string')
    const sdkAssetRef: AssetReference = context.stepConfig.asset
    const sdkAsset = await this.instance.dereferenceAsset(sdkAssetRef, context.chain)
    const evmAsset = sdkAssetToEvmAsset(sdkAsset, context.chain)
    const evmInputAmount = await sdkAssetAndAmountToEvmInputAmount(
      sdkAssetRef,
      context.stepConfig.amount,
      context.chain,
      this.instance,
      false
    )

    const argData = defaultAbiCoder.encode(
      [abi],
      [{ asset: evmAsset, amountToWithdraw: evmInputAmount.amount, amountIsPercent: evmInputAmount.amountIsPercent }]
    )

    return {
      stepTypeId: STEP_TYPE_ID_AAVE_WITHDRAW,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [],
      argData: argData,
    }
  }

  // always assume the caller is the source
  async getAddAssetInfo(stepConfig: AaveWithdraw): Promise<AssetAmount[]> {
    assert(typeof stepConfig.asset !== 'string')
    return [
      {
        asset: stepConfig.asset,
        amount: stepConfig.amount,
      },
    ]
  }
}
