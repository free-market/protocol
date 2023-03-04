import z from 'zod'

export const ASSET_TYPES = ['fungible-token', 'native'] as const
export const assetTypeSchema = z.enum(ASSET_TYPES)
export type AssetType = z.infer<typeof assetTypeSchema>
