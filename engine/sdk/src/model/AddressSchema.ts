import z from 'zod'
import { registerParameterType } from './Parameter'

export const hexStringSchema = z.string().regex(/^0x[a-fA-F0-9]*$/)

export type HexString = z.infer<typeof hexStringSchema>

export const addressSchema = registerParameterType('address', hexStringSchema)

export type Address = z.infer<typeof addressSchema>
