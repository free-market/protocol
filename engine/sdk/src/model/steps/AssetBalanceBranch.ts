import z from 'zod'
import { amountSchema } from '../Amount'
import { assetReferenceSchema } from '../AssetReference'
import { createBranchStepSchema } from '../BranchStep'

export const COMPARISON_OPERATORS = ['greater-than', 'greater-than-equal', 'less-than', 'less-than-equal', 'equal', 'not-equal'] as const
export const comparisonOperatorSchema = z.enum(COMPARISON_OPERATORS)

export const assetBalanceBranchSchema = createBranchStepSchema('asset-balance-branch').extend({
  asset: assetReferenceSchema,
  comparison: comparisonOperatorSchema,
  amount: amountSchema,
})

export interface AssetBalanceBranchSchema extends z.infer<typeof assetBalanceBranchSchema> {}
