import z from 'zod'
import { addressSchema } from './AddressSchema'
import { amountSchema, absoluteAmountSchema, percentSchema } from './Amount'
import { assetAmountSchema } from './AssetAmount'
import { assetReferenceSchema } from './AssetReference'
import { parameterNameSchema } from './Parameter'

export const argumentsSchema = z.record(
  parameterNameSchema,
  z.union([amountSchema, absoluteAmountSchema, percentSchema, addressSchema, assetReferenceSchema, assetAmountSchema])
)

export type Arguments = z.infer<typeof argumentsSchema>
