import z from 'zod'
import { createBranchStepSchema, chainSchema, absoluteAmountSchema, assetReferenceSchema, stepProperties } from '@freemarket/core'

export const chainBranchSchema = createBranchStepSchema('chain-branch').extend({
  currentChain: chainSchema.describe(stepProperties('Chain', 'the chain to compare to the current chain')),
})

export interface ChainBranch extends z.infer<typeof chainBranchSchema> {}

export const COMPARISON_OPERATORS = ['greater-than', 'greater-than-equal', 'less-than', 'less-than-equal', 'equal', 'not-equal'] as const
export const comparisonOperatorSchema = z.enum(COMPARISON_OPERATORS)
export type ComparisonOperator = z.infer<typeof comparisonOperatorSchema>

function createAssetComparisonBranchSchema<T extends string>(stepType: T) {
  return createBranchStepSchema(stepType).extend({
    asset: assetReferenceSchema.describe(stepProperties('Asset', 'the asset to compare against')),
    comparison: comparisonOperatorSchema.describe(stepProperties('Comparison', 'the comparison operator to use')),
    amount: absoluteAmountSchema.describe(stepProperties('Amount', 'the amount to compare against')),
  })
}
export const assetBalanceBranchSchema = createAssetComparisonBranchSchema('asset-balance-branch')

export interface AssetBalanceBranch extends z.infer<typeof assetBalanceBranchSchema> {}

export const previousOutputBranchSchema = createAssetComparisonBranchSchema('previous-output-branch')

export interface PreviousOutputBranch extends z.infer<typeof previousOutputBranchSchema> {}
