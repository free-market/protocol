import { EncodingContext, EncodedWorkflowStep, ADDRESS_ZERO, sdkAssetAndAmountToEvmInputAmount } from '@freemarket/core'
import { AbstractStepHelper } from '@freemarket/step-sdk'
import type { AaveRepay } from './model'
import { defaultAbiCoder } from '@ethersproject/abi'

export const STEP_TYPE_ID_AAVE_REPAY = 111

interface AaveRepayActionArgs {
  interestRateMode: string
}

export class AaveRepayHelper extends AbstractStepHelper<AaveRepay> {
  async encodeWorkflowStep(context: EncodingContext<AaveRepay>): Promise<EncodedWorkflowStep> {
    const evmInputAsset = await sdkAssetAndAmountToEvmInputAmount(
      context.stepConfig.asset,
      context.stepConfig.amount,
      context.chain,
      this.instance,
      false
    )

    const repayArgs: AaveRepayActionArgs = {
      interestRateMode: context.stepConfig.interestRateMode === 'stable' ? '1' : '2',
    }
    const argData = defaultAbiCoder.encode(
      [
        `tuple(
          uint256 interestRateMode
        )`,
      ],
      [repayArgs]
    )

    const ret: EncodedWorkflowStep = {
      stepTypeId: STEP_TYPE_ID_AAVE_REPAY,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [evmInputAsset],
      argData,
    }

    return ret
  }
}
