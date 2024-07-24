import z from 'zod'

export const ASSET_TYPES = ['fungible-token', 'native'] as const
export const assetTypeSchema = z.enum(ASSET_TYPES)
export type AssetType = z.infer<typeof assetTypeSchema>

export const ASSET_TYPE_NATIVE = 0;
export const ASSET_TYPE_ERC20 = 1;
export const ASSET_TYPE_ERC721 = 2;
