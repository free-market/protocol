import test from 'ava'
import { ETHEREUM_TOKENS } from '../assetInfo'
import { Asset, AssetType, BlockChain } from '../types'
import { AssetBalances } from './AssetBalances'

test('tracks balances', t => {
  const assetBalances = new AssetBalances()
  t.snapshot(assetBalances.toArray())
  assetBalances.credit(ETHEREUM_TOKENS.USDC, BigInt(10))
  t.snapshot(assetBalances.toArray())
  assetBalances.debit(ETHEREUM_TOKENS.USDC, BigInt(10))
  t.snapshot(assetBalances.toArray())
})
