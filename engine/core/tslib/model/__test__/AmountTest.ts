import test from 'ava'
import { amountSchema } from '../Amount'

test('validates numbers', t => {
  amountSchema.parse('123')
  amountSchema.parse(123)
  amountSchema.parse('123.345')
  t.throws(() => amountSchema.parse('123.345.'))
  t.throws(() => amountSchema.parse('123.345.000'))
  t.throws(() => amountSchema.parse('123.xyz'))
})
