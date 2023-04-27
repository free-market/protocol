import z from 'zod'
import { registerParameterType } from './Parameter'

/**  digits with an optional single decimal point followed by more digits */
export const decimalStringSchema = z.string().regex(/^\d+(\.\d+)?$/)

/** decimal string followed by a required percent sign  */
export const percentStringSchema = z.string().regex(/^\d+(\.\d+)?%$/)

/** a decimal string followed by an optional percent sign */
export const amountStringSchema = z.string().regex(/^\d+(\.\d+)?%?$/)

export const absoluteAmountSchema = registerParameterType('absolute-amount', z.union([decimalStringSchema, z.number(), z.bigint()]))

export type AbsoluteAmount = z.infer<typeof absoluteAmountSchema>

// export const percentAmountSchema = registerParameterType('percent-amount', z.union([percentStringSchema, z.number()]))

// export type PercentAmount = z.infer<typeof percentAmountSchema>

// export const percentSchema = z.union([percentStringSchema, z.number(), z.bigint()])
// export const percentNumberSchema = registerParameterType('percent', z.number().min(0).max(100))

function isValidPercent(val: string | number) {
  const f = typeof val === 'number' ? val : parseFloat(val)
  if (!isNaN(f)) {
    return f >= 0 && f <= 100
  }
  return false
}

export const percentSchema = registerParameterType(
  'percent',
  decimalStringSchema.or(z.number()).refine(isValidPercent, 'must be a number between 0 and 100')
)

export type Percent = z.infer<typeof percentSchema>

export const amountSchema = registerParameterType('amount', z.union([amountStringSchema, z.number(), z.bigint()]))

/** Convenience data type for representing any type of numeric amount, including JavaScript's strings, numbers and BigInts */
export type Amount = z.infer<typeof amountSchema>

export const numberSchema = registerParameterType('number', z.union([z.number(), z.bigint()]))
