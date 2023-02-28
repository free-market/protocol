import test from 'ava'
import { AssetAmount, assetAmountSchema } from '../AssetAmount'
import yupToJsonSchema from '@sodaru/yup-to-json-schema'

test('validates', t => {
  const asset: AssetAmount = {
    symbol: 'ABC',
    amount: 2,
  }

  assetAmountSchema.validateSync(asset)
  const jsonSchema = yupToJsonSchema(assetAmountSchema)
  t.log(JSON.stringify(jsonSchema, null, 4))
  t.pass()
})

// test('reads ')
