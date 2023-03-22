import test from 'ava'
import { addressSchema } from '../Address'

test('validates', t => {
  addressSchema.parse('0x01234567890abcdefABCDEF45678901234567890')
  t.throws(() => addressSchema.parse(''))
  t.throws(() => addressSchema.parse('0'))
  t.throws(() => addressSchema.parse('x'))
  t.throws(() => addressSchema.parse('0xg'))
})
