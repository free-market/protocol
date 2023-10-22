import z from 'zod'

// chains as iterable values
export const CHAINS = [
  'ethereum',
  'arbitrum',
  'avalanche',
  'polygon',
  'binance',
  'optimism',
  'fantom',
  'hardhat',
  'local',
  'ethereumGoerli',
] as const

export const chainSchema = z.enum(CHAINS)

export type Chain = z.infer<typeof chainSchema>
