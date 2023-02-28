import test from 'ava'
import Big from 'big.js'
import { numberSchema } from '../Number'

test('validates numbers', t => {
  const s = '123456789012345678901234567890'

  // pass through
  numberSchema.validateSync('123')
  numberSchema.validateSync('123.345')
  t.throws(() => numberSchema.validateSync('123.345.'))
  t.throws(() => numberSchema.validateSync('123.345.000'))
  t.throws(() => numberSchema.validateSync('123.xyz'))

  t.pass()
})
