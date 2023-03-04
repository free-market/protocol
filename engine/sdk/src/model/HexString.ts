import z from 'zod'

export const hexStringSchema = z.string().regex(/^0x[a-fA-F0-9]*$/)

export type HexString = z.infer<typeof hexStringSchema>
