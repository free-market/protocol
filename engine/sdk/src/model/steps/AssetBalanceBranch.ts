import z from 'zod'
import { amountSchema, assetReferenceSchema, createBranchStepSchema } from '@freemarket/core'

export const COMPARISON_OPERATORS = ['greater-than', 'greater-than-equal', 'less-than', 'less-than-equal', 'equal', 'not-equal'] as const
export const comparisonOperatorSchema = z.enum(COMPARISON_OPERATORS)

export const assetBalanceBranchSchema = createBranchStepSchema('asset-balance-branch').extend({
  asset: assetReferenceSchema,
  comparison: comparisonOperatorSchema,
  amount: amountSchema,
})

export interface AssetBalanceBranchSchema extends z.infer<typeof assetBalanceBranchSchema> {}
