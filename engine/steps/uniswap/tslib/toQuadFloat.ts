import Big from 'big.js'

//  https://en.wikipedia.org/wiki/Quadruple-precision_floating-point_format#:~:text=The%20quadruple%2Dprecision%20binary%20floating,in%20the%20IEEE%20754%20standard.
// https://www.h-schmidt.net/FloatConverter/IEEE754.html

const EXPONENT_BITS = 15
const MANTISSA_BITS = 112
const EXPONENT_OFFSET = new Big(2)
  .pow(EXPONENT_BITS - 1)
  .minus(1)
  .toNumber()

function getTrueExponent(n: Big) {
  if (n.gte(1)) {
    const whole = BigInt(n.abs().round(0, 0).toFixed(0))
    // console.log('getTrueExponent asBig', whole)
    const trueExponent = whole.toString(2).length - 1
    return trueExponent
  }
  return Math.floor(Math.log2(n.abs().toNumber()))
}

function bigToBits(n: Big): string {
  const bn = BigInt(n.toFixed(0))
  let s = bn.toString(2)
  while (s.startsWith('0')) {
    s = s.slice(1)
  }
  return s
}

function getWholeNumberMantissa(n: Big) {
  const abs = n.abs()
  const wholePart = abs.round(0, 0)
  return bigToBits(wholePart)
}

function getFractionalMantissa(n: Big, maxDecimalBits: number) {
  if (n.eq(0)) {
    return ''
  }
  const abs = n.abs()
  const wholePart = abs.round(0, 0)
  const decimalPart = abs.minus(wholePart)
  const denom = new Big(2).pow(maxDecimalBits)
  return bigToBits(decimalPart.mul(denom))
}

export function toQuadFloatt(b: Big) {
  const trueExponent = getTrueExponent(b)
  // const w = getWholeNumberMantissa(b)
  // const f = getFractionalMantissa(b, MANTISSA_BITS - trueExponent)
  const mantissaWithImplicitLeadingOne =
    getWholeNumberMantissa(b) + getFractionalMantissa(b, MANTISSA_BITS - trueExponent).padStart(MANTISSA_BITS, '0')
  const mantissa = mantissaWithImplicitLeadingOne.slice(1)
  const exponent = BigInt(trueExponent + EXPONENT_OFFSET)
    .toString(2)
    .padStart(EXPONENT_BITS, '0')
  const sign = b.lt(0) ? '1' : '0'
  const bits = sign + exponent + mantissa
  const value = BigInt(`0b${bits}`)
  const valueHex = '0x' + value.toString(16)

  // return { exponent, trueExponent, mantissa, bits, valueHex }
  return valueHex
}

// console.log(foo(new Big(process.argv[2])))
