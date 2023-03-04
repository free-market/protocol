import test from 'ava'
import { Step, stepSchema } from '../../Step'
import { addAssetSchema } from '../AddAsset'

test('validates adding native', t => {
  const addNative: Step = {
    type: 'add-asset',
    asset: {
      type: 'native',
    },
    amount: 1,
  }
  addAssetSchema.parse(addNative)
  stepSchema.parse(addNative)

  const badStep: any = { ...addNative }
  delete badStep.amount
  t.throws(() => addAssetSchema.parse(badStep))
})
test('validates adding fungible tokens', t => {
  const addNative: Step = {
    type: 'add-asset',
    asset: {
      type: 'fungible-token',
      symbol: 'ABC',
    },
    amount: 1,
  }
  addAssetSchema.parse(addNative)

  const badStep: any = { ...addNative }
  delete badStep.amount
  t.throws(() => addAssetSchema.parse(badStep))
})
