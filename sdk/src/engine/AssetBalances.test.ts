import test from 'ava'

import { AssetBalances } from './AssetBalances'
import { BigNumber } from 'ethers'
import { Asset } from '../types'

test('tracks balances', t => {
  const assetBalances = new AssetBalances()
  const asset = new Asset('Ethereum', 'USDC')
  t.snapshot(assetBalances.toArray())
  assetBalances.credit(asset, BigNumber.from(10))
  t.snapshot(assetBalances.toArray())
  assetBalances.debit(asset, BigNumber.from(10))
  t.snapshot(assetBalances.toArray())
})
