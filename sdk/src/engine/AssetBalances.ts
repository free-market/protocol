import { Asset, AssetBalance } from '../types'
import { BigNumber } from 'ethers'

const NEGATIVE_ONE_BIGNUMBER = BigNumber.from(-1)

export class AssetBalances {
  balances = new Map<string, BigNumber>()
  assets = new Map<string, Asset>()

  get(asset: Asset): BigNumber | undefined {
    const key = AssetBalances.toKey(asset)
    return this.balances.get(key)
  }

  credit(asset: Asset, amount: BigNumber): BigNumber {
    const key = AssetBalances.toKey(asset)
    const currentBalance = this.balances.get(key) || BigNumber.from(0)
    const newBalance = currentBalance.add(amount)
    this.balances.set(key, newBalance)
    this.assets.set(key, asset)
    return newBalance
  }

  debit(asset: Asset, amount: BigNumber): BigNumber {
    return this.credit(asset, amount.mul(NEGATIVE_ONE_BIGNUMBER))
  }

  toArray(): AssetBalance[] {
    const rv = [] as AssetBalance[]
    this.balances.forEach((balance, key) => {
      rv.push({
        asset: this.assets.get(key)!,
        balance: balance.toString(),
      })
    })
    return rv
  }

  private static toKey(asset: Asset) {
    return `${asset.blockChain}.${asset.symbol}`
  }
}
