import z from 'zod'
import { createBranchStepSchema, chainSchema, absoluteAmountSchema, assetReferenceSchema } from '@freemarket/core'

export const chainBranchSchema = createBranchStepSchema('chain-branch').extend({
  currentChain: chainSchema,
})

export interface ChainBranch extends z.infer<typeof chainBranchSchema> {}

export const COMPARISON_OPERATORS = ['greater-than', 'greater-than-equal', 'less-than', 'less-than-equal', 'equal', 'not-equal'] as const
export const comparisonOperatorSchema = z.enum(COMPARISON_OPERATORS)
export type ComparisonOperator = z.infer<typeof comparisonOperatorSchema>

export const assetBalanceBranchSchema = createBranchStepSchema('asset-balance-branch').extend({
  asset: assetReferenceSchema,
  comparison: comparisonOperatorSchema,
  amount: absoluteAmountSchema,
})

export interface AssetBalanceBranch extends z.infer<typeof assetBalanceBranchSchema> {}
