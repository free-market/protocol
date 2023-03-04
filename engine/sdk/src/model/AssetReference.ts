import z from 'zod'
import { nonEmptyStringSchema } from './NonEmptyString'

export function createAssetReferenceSchema<T extends string>(type: T) {
  return z.object({
    type: z.literal(type).describe('The type of asset.'),
  })
}

export const nativeAssetReferenceSchema = createAssetReferenceSchema('native')

export const fungibleTokenAssetReferenceSchema = createAssetReferenceSchema('fungible-token').extend({
  symbol: nonEmptyStringSchema.describe('The symbol for this token.'),
})

export const assetReferenceSchema = z.discriminatedUnion('type', [nativeAssetReferenceSchema, fungibleTokenAssetReferenceSchema])

export type AssetReference = z.infer<typeof assetReferenceSchema>
