import test from 'ava'
import { hexStringSchema } from '../HexString'

test('validates', t => {
  hexStringSchema.parse('0x')
  hexStringSchema.parse('0x0234567890abcdefABCDEF')
  t.throws(() => hexStringSchema.parse(''))
  t.throws(() => hexStringSchema.parse('0'))
  t.throws(() => hexStringSchema.parse('x'))
  t.throws(() => hexStringSchema.parse('0xg'))
})
