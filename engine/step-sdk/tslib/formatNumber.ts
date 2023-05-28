import { commify, formatUnits } from '@ethersproject/units'
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'

export function formatNumber(bn: BigNumberish, decimals: number, fractionalDigits = 4, commas = true) {
  const s = formatUnits(BigNumber.from(bn), decimals)
  let [whole, fraction] = s.split('.')
  if (commas) {
    whole = commify(whole)
  }
  if (decimals === 0) {
    return whole
  }
  fraction = fraction.padEnd(fractionalDigits, '0')
  fraction = fraction.slice(0, fractionalDigits)
  return `${whole}.${fraction}`
}
