import axios from 'axios'

import { FungibleToken, fungibleTokenMetadataSchema } from './model'

export const baseTokenUrl = 'https://metadata.fmprotocol.com/test'

export async function getDefaultFungibleTokens(): Promise<Record<string, FungibleToken>> {
  const response = await axios.get(`${baseTokenUrl}/tokens.json`)
  return fungibleTokenMetadataSchema.parse(response.data)
}
