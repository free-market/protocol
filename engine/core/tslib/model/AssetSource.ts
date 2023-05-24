import z from 'zod'
import { registerParameterType } from './Parameter'

export const assetSourceSchema = registerParameterType('asset-source', z.union([z.literal('caller'), z.literal('workflow')]))

export type AssetSource = z.infer<typeof assetSourceSchema>
