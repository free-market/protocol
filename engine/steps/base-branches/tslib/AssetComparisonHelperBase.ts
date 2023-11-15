import type { AssetBalanceBranch, PreviousOutputBranch } from './model'
import { ADDRESS_ZERO, EncodedWorkflowStep, EncodingContext, sdkAssetAndAmountToEvmInputAmount } from '@freemarket/core'
import { AbstractBranchHelper, AssetSchema } from '@freemarket/step-sdk'

import * as ethers from 'ethers'
import { ComparisonOrdinals } from './ComparisonOrdinals'
import { getLogger } from '@freemarket/core'

const logger = getLogger('AssetBalanceBranchHelper')
const abiCoder = ethers.utils.defaultAbiCoder

export const STEP_TYPE_ID_ASSET_BALANCE_BRANCH = 2

const AssetBalanceBranchParamsSchema = `
  tuple AssetAmountBranchParams (
    ${AssetSchema} asset,
    uint256 comparison,
    uint256 amount,
    int16 ifYes
  )
`
type AssetBalanceComparisonBranch = PreviousOutputBranch | AssetBalanceBranch

export abstract class AssetComparisonHelperBase extends AbstractBranchHelper<AssetBalanceComparisonBranch> {
  async encodeWorkflowStepForStepId(
    context: EncodingContext<AssetBalanceComparisonBranch>,
    stepTypeId: number
  ): Promise<EncodedWorkflowStep> {
    const { stepConfig, mapStepIdToIndex, chain } = context
    const { ifYes, asset: assetRef, comparison, amount } = stepConfig
    const ifYesIndex = ifYes ? mapStepIdToIndex.get(ifYes) : -1
    // assert(ifYesIndex !== undefined, `Could not find step with id ${ifYes}`)
    const comparisonOrdinal = ComparisonOrdinals[comparison]
    const sdkAsset = await this.instance.dereferenceAsset(assetRef, chain)
    const evmAssetAmount = await sdkAssetAndAmountToEvmInputAmount(sdkAsset, amount, chain, this.instance, false)
    logger.debug('evmAssetAmount', evmAssetAmount)
    const argData = abiCoder.encode(
      [AssetBalanceBranchParamsSchema],
      [
        {
          asset: evmAssetAmount.asset,
          comparison: comparisonOrdinal,
          amount: evmAssetAmount.amount,
          ifYes: ifYesIndex,
        },
      ]
    )
    return {
      stepTypeId,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [],
      argData,
    }
  }
}
