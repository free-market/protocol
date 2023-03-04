import test from 'ava'
import { AssetAmount, assetAmountSchema } from '../AssetAmount'

test('validates fungible tokens', t => {
  // valid
  const assetAmount: AssetAmount = {
    asset: {
      type: 'fungible-token',
      symbol: 'ABC',
    },
    amount: 2,
  }
  assetAmountSchema.parse(assetAmount)

  assetAmount.amount = '100.0'
  assetAmountSchema.parse(assetAmount)
  assetAmount.amount = '100.00%'
  assetAmountSchema.parse(assetAmount)

  assetAmount.amount = '100.'
  t.throws(() => assetAmountSchema.parse(assetAmount))
  assetAmount.amount = '100.00.00'
  t.throws(() => assetAmountSchema.parse(assetAmount))
})

test('validates native', t => {
  const assetAmount: AssetAmount = {
    asset: {
      type: 'native',
    },
    amount: 1,
  }
  assetAmountSchema.parse(assetAmount)
  t.pass()
})

// test('reads ')
