import z from 'zod'

/**  digits with an optional single decimal point followed by more digits */
export const decimalStringSchema = z.string().regex(/^\d+(\.\d+)?$/)

/** decimal string followed by a required percent sign  */
export const percentStringSchema = z.string().regex(/^\d+(\.\d+)?%$/)

/** a decimal string followed by an optional percent sign */
export const amountStringSchema = z.string().regex(/^\d+(\.\d+)?%?$/)

export const absoluteAmountSchema = z.union([decimalStringSchema, z.number(), z.bigint()])

export type AbsoluteAmount = z.infer<typeof absoluteAmountSchema>

export const percentSchema = z.union([percentStringSchema, z.number(), z.bigint()])

export type Percent = z.infer<typeof percentSchema>

export const amountSchema = z.union([amountStringSchema, z.number(), z.bigint()])

/** Convenience data type for representing any type of numeric amount, including JavaScript's strings, numbers and BigInts */
export type Amount = z.infer<typeof amountSchema>
