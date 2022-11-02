import { Asset, AssetBalance } from '../types'
import { BigNumber } from 'ethers'

const NEGATIVE_ONE_BIGNUMBER = BigNumber.from(-1)

export class AssetBalances {
  balances = new Map<string, BigNumber>()

  get(asset: Asset): BigNumber | undefined {
    return this.balances.get(asset.toString())
  }

  credit(asset: Asset, amount: BigNumber): BigNumber {
    const key = asset.toString()
    const currentBalance = this.balances.get(key) || BigNumber.from(0)
    const newBalance = currentBalance.add(amount)
    this.balances.set(key, newBalance)
    return newBalance
  }

  debit(asset: Asset, amount: BigNumber): BigNumber {
    return this.credit(asset, amount.mul(NEGATIVE_ONE_BIGNUMBER))
  }

  toArray(): AssetBalance[] {
    const rv = [] as AssetBalance[]
    this.balances.forEach((balance, assetKey) => {
      rv.push({
        asset: Asset.fromString(assetKey),
        balance: balance.toString(),
      })
    })
    return rv
  }
}
