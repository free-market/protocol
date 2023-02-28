// chain _values_
export const CHAINS = ['ethereum', 'arbitrum', 'avalanche', 'polygon', 'binance', 'optimism', 'fantom'] as const
// Chain as a type (union of string types derives from the CHAIN values)
export type Chain = typeof CHAINS[number]
