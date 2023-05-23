import z from 'zod'

export const assetSourceSchema = z.union([z.literal('caller'), z.literal('workflow')])

export type AssetSource = z.infer<typeof assetSourceSchema>
