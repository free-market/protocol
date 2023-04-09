import {
  parameterNameSchema,
  amountSchema,
  absoluteAmountSchema,
  percentSchema,
  addressSchema,
  assetReferenceSchema,
  assetAmountSchema,
} from '@freemarket/core'
import z from 'zod'

export const argumentsSchema = z.record(
  parameterNameSchema,
  z.union([amountSchema, absoluteAmountSchema, percentSchema, addressSchema, assetReferenceSchema, assetAmountSchema])
)

export type Arguments = z.infer<typeof argumentsSchema>
