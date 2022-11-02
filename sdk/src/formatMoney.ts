import { AssetAmount } from './types'
import Big from 'big.js'

const TEN = Big(10)

export function formatMoney(amount: AssetAmount, decimals: number, maxDecimals?: number) {
  const s = amount.toString()
  if (s.endsWith('%')) {
    return s
  }

  const left = s.slice(0, s.length - decimals)
  const right = s.slice(s.length - decimals, s.length)
  let rv: string = left + '.' + right

  if (rv === '.0') {
    return '0'
  }
  if (right.length > 0 && maxDecimals && right.length > maxDecimals) {
    const n = Big(rv)
    rv = n.toFixed(maxDecimals)
  }
  return stripTrailingZeros(rv)
}

const ZERO_STRIPPER_EXPR = /(^[0-9]+\.[0-9]*?)0*$/
function stripTrailingZeros(s: string): string {
  const m = ZERO_STRIPPER_EXPR.exec(s)
  if (m) {
    const stripped = m[1]
    if (stripped.endsWith('.')) {
      return stripped.slice(0, stripped.length - 1)
    }
    return stripped
  }
  return s
}
