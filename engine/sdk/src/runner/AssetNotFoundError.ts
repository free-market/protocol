import type { Chain } from '../model'

export class AssetNotFoundError extends Error {
  symbol: string | null
  chain: Chain | null
  constructor(symbol: string | null, chain: Chain | null) {
    if (symbol) {
      const prefix = `Could fungible-token asset for find symbol '${symbol}'`
      if (chain) {
        super(`${prefix} for chain '${chain}'`)
      } else {
        super(prefix)
      }
    } else {
      super(`Could not find native asset for chain '${chain}'`)
    }
    this.symbol = symbol
    this.chain = chain
  }
}
