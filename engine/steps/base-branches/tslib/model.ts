import z from 'zod'
import { createBranchStepSchema, chainSchema, absoluteAmountSchema, assetReferenceSchema, stepProperties } from '@freemarket/core'

export const chainBranchSchema = createBranchStepSchema('chain-branch').extend({
  currentChain: chainSchema.describe(stepProperties('Chain', 'the chain to compare to the current chain')),
})

export interface ChainBranch extends z.infer<typeof chainBranchSchema> {}

export const COMPARISON_OPERATORS = ['greater-than', 'greater-than-equal', 'less-than', 'less-than-equal', 'equal', 'not-equal'] as const
export const comparisonOperatorSchema = z.enum(COMPARISON_OPERATORS)
export type ComparisonOperator = z.infer<typeof comparisonOperatorSchema>

export const assetBalanceBranchSchema = createBranchStepSchema('asset-balance-branch').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'the asset to compare against')),
  comparison: comparisonOperatorSchema.describe(stepProperties('Comparison', 'the comparison operator to use')),
  amount: absoluteAmountSchema.describe(stepProperties('Amount', 'the amount to compare against')),
})

export interface AssetBalanceBranch extends z.infer<typeof assetBalanceBranchSchema> {}
