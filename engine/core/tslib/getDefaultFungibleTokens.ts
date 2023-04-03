import axios from 'axios'
import z from 'zod'

import { FungibleToken, fungibleTokenSchema } from './model'

export async function getDefaultFungibleTokens(): Promise<Record<string, FungibleToken>> {
  const response = await axios.get('https://metadata.fmprotocol.com/tokens.json')
  const tokenSchema = z.record(z.string(), fungibleTokenSchema)
  return tokenSchema.parse(response.data)
}
