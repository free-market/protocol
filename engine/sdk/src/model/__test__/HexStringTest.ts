import test from 'ava'
import { addressSchema } from '../AddressSchema'

test('validates', t => {
  addressSchema.parse('0x')
  addressSchema.parse('0x0234567890abcdefABCDEF')
  t.throws(() => addressSchema.parse(''))
  t.throws(() => addressSchema.parse('0'))
  t.throws(() => addressSchema.parse('x'))
  t.throws(() => addressSchema.parse('0xg'))
})
