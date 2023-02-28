import { lazy, object, ObjectSchema, string } from 'yup'
import { CHAINS } from './Chain'

const ASSET_TYPES = ['erc20'] as const
export type AssetType = typeof ASSET_TYPES[number]

export interface AssetChainInfo {
  type: AssetType
  address: string
}

const assetChainInfoSchema: ObjectSchema<AssetChainInfo> = object({
  type: string<AssetType>().defined(),
  address: string().defined(),
})

export interface Asset {
  symbol: string
  name: string
  iconUrl: string
  chains: { [chain: string]: AssetChainInfo }
}

export const assetSchema: ObjectSchema<Asset> = object({
  symbol: string().defined(),
  name: string().defined(),
  iconUrl: string().defined(),
  chains: lazy(val => {
    const ret: { [chain: string]: ObjectSchema<AssetChainInfo> } = {}
    for (const chain of Object.keys(val)) {
      ret[chain] = assetChainInfoSchema
    }
    return object(ret)
  }),
})
