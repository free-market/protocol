import z from 'zod'
import type { Amount} from './Amount';
import { amountSchema } from './Amount'
import type { AssetReference} from './AssetReference';
import { assetReferenceSchema } from './AssetReference'
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
