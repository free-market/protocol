import type { ChainBranch } from './model'
import { ADDRESS_ZERO, EncodedWorkflowStep, EncodingContext, assert, getChainIdFromChain } from '@freemarket/core'
import { AbstractBranchHelper, AssetSchema } from '@freemarket/step-sdk'

import * as ethers from 'ethers'

const abiCoder = ethers.utils.defaultAbiCoder

const STEP_TYPE_ID_CHAIN_BRANCH = 1

const ChainBranchParamsSchema = `
  tuple(
    uint256 chainId,
    int16 ifYes
  )
`

const AssetAmountBranchParamsSchema = `
  tuple AssetAmountBranchParams (
    ${AssetSchema} asset,
    Comparison comparison,
    uint256 amount,
    int16 ifYes
  )
`

export class ChainBranchHelper extends AbstractBranchHelper<ChainBranch> {
  encodeWorkflowStep(context: EncodingContext<ChainBranch>): Promise<EncodedWorkflowStep> {
    const { stepConfig, mapStepIdToIndex } = context
    const { ifYes, currentChain } = stepConfig
    const ifYesIndex = mapStepIdToIndex.get(ifYes)
    assert(ifYesIndex !== undefined, `Could not find step with id ${ifYes}`)

    const chainId = getChainIdFromChain(currentChain, false)
    // console.log('current chain', currentChain, chainId)
    const argData = abiCoder.encode([ChainBranchParamsSchema], [{ chainId, ifYes: ifYesIndex }])
    return Promise.resolve({
      stepTypeId: STEP_TYPE_ID_CHAIN_BRANCH,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [],
      argData,
    })
  }
}
