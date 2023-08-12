import type { AssetBalanceBranch, ComparisonOperator, PreviousOutputBranch } from './model'
import {
  ADDRESS_ZERO,
  EncodedWorkflowStep,
  EncodingContext,
  assert,
  getChainIdFromChain,
  sdkAssetAndAmountToEvmInputAmount,
  sdkAssetToEvmAsset,
} from '@freemarket/core'
import { AbstractBranchHelper, AssetSchema } from '@freemarket/step-sdk'

import * as ethers from 'ethers'
import { ComparisonOrdinals } from './ComparisonOrdinals'

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

export abstract class AssetComparisonHelperBase extends AbstractBranchHelper<PreviousOutputBranch | AssetBalanceBranch> {
  async encodeWorkflowStepForStepId(context: EncodingContext<AssetBalanceBranch>, stepTypeId: number): Promise<EncodedWorkflowStep> {
    const { stepConfig, mapStepIdToIndex, chain } = context
    const { ifYes, asset: assetRef, comparison, amount } = stepConfig
    const ifYesIndex = ifYes ? mapStepIdToIndex.get(ifYes) : -1
    // assert(ifYesIndex !== undefined, `Could not find step with id ${ifYes}`)
    let comparisonOrdinal = ComparisonOrdinals[comparison]
    const sdkAsset = await this.instance.dereferenceAsset(assetRef, chain)
    const evmAssetAmount = await sdkAssetAndAmountToEvmInputAmount(sdkAsset, amount, chain, this.instance, false)
    console.log('evmAssetAmount', evmAssetAmount)
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
