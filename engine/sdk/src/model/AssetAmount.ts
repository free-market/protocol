import z from 'zod'
import { Amount, amountSchema } from './Amount'
import { AssetReference, assetReferenceSchema } from './AssetReference'
import { registerParameterType } from './Parameter'

export interface AssetAmount {
  asset: AssetReference
  amount: Amount
}

const assetAmountStrictSchema: z.ZodType<AssetAmount> = z.object({
  asset: assetReferenceSchema,
  /** The amount of the asset */
  amount: amountSchema,
})

export const assetAmountSchema = registerParameterType('asset-amount', assetAmountStrictSchema)
