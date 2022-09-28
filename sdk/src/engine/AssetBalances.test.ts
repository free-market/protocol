import test from 'ava'
import { ETHEREUM_TOKENS } from '../assetInfo'
import { AssetBalances } from './AssetBalances'
import { BigNumber } from 'ethers'

test('tracks balances', t => {
  const assetBalances = new AssetBalances()
  t.snapshot(assetBalances.toArray())
  assetBalances.credit(ETHEREUM_TOKENS.USDC, BigNumber.from(10))
  t.snapshot(assetBalances.toArray())
  assetBalances.debit(ETHEREUM_TOKENS.USDC, BigNumber.from(10))
  t.snapshot(assetBalances.toArray())
})
