import { Asset, AssetBalance } from '../types'

const NEGATIVE_ONE_BIGINT = BigInt(-1)

export class AssetBalances {
  balances = new Map<string, bigint>()
  assets = new Map<string, Asset>()

  get(asset: Asset): bigint | undefined {
    const key = AssetBalances.toKey(asset)
    return this.balances.get(key)
  }

  credit(asset: Asset, amount: bigint): bigint {
    const key = AssetBalances.toKey(asset)
    const currentBalance = this.balances.get(key) || BigInt(0)
    const newBalance = currentBalance + amount
    this.balances.set(key, newBalance)
    this.assets.set(key, asset)
    return newBalance
  }

  debit(asset: Asset, amount: bigint): bigint {
    return this.credit(asset, amount * NEGATIVE_ONE_BIGINT)
  }

  toArray(): AssetBalance[] {
    const rv = [] as AssetBalance[]

    this.balances.forEach((balance, key) => {
      rv.push({
        asset: this.assets.get(key)!,
        balance,
      })
    })
    return rv
  }

  private static toKey(asset: Asset) {
    return `${asset.blockChain}.${asset.symbol}`
  }
}
