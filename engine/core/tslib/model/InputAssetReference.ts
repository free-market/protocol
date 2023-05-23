import z from 'zod'
import { nonEmptyStringSchema } from './NonEmptyString'
import { registerParameterType } from './Parameter'
import { assetSourceSchema } from './AssetSource'
import { fungibleTokenAssetReferenceSchema, nativeAssetReferenceSchema } from './AssetReference'

export const nativeInputAssetReferenceSchema = nativeAssetReferenceSchema.extend({
  source: assetSourceSchema,
})

export interface NativeInputAssetReference extends z.infer<typeof nativeInputAssetReferenceSchema> {}

export const fungibleTokenInputAssetReferenceSchema = fungibleTokenAssetReferenceSchema.extend({
  source: assetSourceSchema,
})

export interface FungibleTokenInputAssetReference extends z.infer<typeof fungibleTokenInputAssetReferenceSchema> {}

export const inputAssetReferenceSchema = registerParameterType(
  'asset-ref',
  z.discriminatedUnion('type', [nativeInputAssetReferenceSchema, fungibleTokenInputAssetReferenceSchema])
)
