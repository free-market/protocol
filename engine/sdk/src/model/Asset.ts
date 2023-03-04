import z from 'zod'
import { assetTypeSchema } from './AssetType'
import { chainSchema } from './Chain'
import { hexStringSchema } from './HexString'
import { nonEmptyStringSchema } from './NonEmptyString'

export const assetBaseSchema = z.object({
  type: assetTypeSchema,
  /** The url of an icon for the asset, useful in UIs. */
  iconUrl: z.string().min(1).optional(),
})

export function createAssetSchema<T extends string>(type: T) {
  return assetBaseSchema.extend({
    type: z.literal(type).describe('The type of asset.'),
  })
}

export const nativeAssetSchema = createAssetSchema('native').extend({
  /** The user friendly display name of the asset. */
  name: z.record(chainSchema, nonEmptyStringSchema),
})

export interface NativeAsset extends z.infer<typeof nativeAssetSchema> {}

export const assetChainInfoSchema = z.object({
  /** The address of the asset.  */
  address: hexStringSchema,
})

/** Chain specific asset information. */
export interface FungibleTokenChainInfo extends z.infer<typeof assetChainInfoSchema> {}

export const fungibleTokenSchema = createAssetSchema('fungible-token').extend({
  /** The symbol of the asset. Used as the primary identifier for the asset */
  symbol: z.string().min(1),

  /** The user friendly display name of the asset. */
  name: z.string().min(1).optional(),

  /** Info about the asset on each supported chain */
  chains: z.record(chainSchema, assetChainInfoSchema),
})

/** Asset represents anything holding value on the blockchain for a user.  */
export interface FungibleToken extends z.infer<typeof fungibleTokenSchema> {}

export const assetSchema = z.discriminatedUnion('type', [nativeAssetSchema, fungibleTokenSchema])

export type Asset = z.infer<typeof assetSchema>
