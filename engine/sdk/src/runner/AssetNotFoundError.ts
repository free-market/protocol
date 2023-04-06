import type { Chain } from '@freemarket/core'

export class AssetNotFoundProblem {
  symbol: string | null
  chain: Chain | null
  message: string
  path?: string[]
  constructor(symbol: string | null, chain: Chain | null, path?: string[]) {
    if (symbol) {
      const prefix = `Could not find fungible-token asset with symbol '${symbol}'`
      if (chain) {
        this.message = `${prefix} for chain '${chain}'`
      } else {
        this.message = prefix
      }
    } else {
      this.message = `Could not find native asset for chain '${chain}'`
    }
    if (path) {
      this.message += ` at path ${JSON.stringify(path)}`
    }
    this.symbol = symbol
    this.chain = chain
    this.path = path
  }
}
export class AssetNotFoundError extends Error {
  problems: AssetNotFoundProblem[]
  constructor(problems: AssetNotFoundProblem[]) {
    super(problems.map(it => it.message).join('\n'))
    this.problems = problems
  }
}
