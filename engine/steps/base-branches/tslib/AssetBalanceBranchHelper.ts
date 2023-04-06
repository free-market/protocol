import type { AssetBalanceBranch, ComparisonOperator } from './model'
import { ADDRESS_ZERO, EncodedWorkflowStep, EncodingContext, assert, getChainIdFromChain, sdkAssetToEvmAsset } from '@freemarket/core'
import { AbstractBranchHelper, AssetSchema } from '@freemarket/step-sdk'

import * as ethers from 'ethers'

const abiCoder = ethers.utils.defaultAbiCoder

const STEP_TYPE_ID_ASSET_BALANCE_BRANCH = 2

const AssetBalanceBranchParamsSchema = `
  tuple AssetAmountBranchParams (
    ${AssetSchema} asset,
    uint256 comparison,
    uint256 amount,
    int16 ifYes
  )
`

const ComparisonOrdinals: Record<ComparisonOperator, number> = {
  equal: 0,
  'not-equal': 1,
  'less-than': 2,
  'less-than-equal': 3,
  'greater-than': 4,
  'greater-than-equal': 5,
}

export class AssetBalanceBranchHelper extends AbstractBranchHelper<AssetBalanceBranch> {
  async encodeWorkflowStep(context: EncodingContext<AssetBalanceBranch>): Promise<EncodedWorkflowStep> {
    const { stepConfig, mapStepIdToIndex, chain } = context
    const { ifYes, asset: assetRef, comparison, amount } = stepConfig
    const ifYesIndex = mapStepIdToIndex.get(ifYes)
    assert(ifYesIndex !== undefined, `Could not find step with id ${ifYes}`)
    let comparisonOrdinal = ComparisonOrdinals[comparison]
    const sdkAsset = await this.instance.dereferenceAsset(assetRef, chain)
    const evmAsset = sdkAssetToEvmAsset(sdkAsset, chain)
    const argData = abiCoder.encode(
      [AssetBalanceBranchParamsSchema],
      [
        {
          asset: evmAsset,
          comparison: comparisonOrdinal,
          amount,
          ifYes: ifYesIndex,
        },
      ]
    )
    return {
      stepTypeId: STEP_TYPE_ID_ASSET_BALANCE_BRANCH,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [],
      argData,
    }
  }
}
