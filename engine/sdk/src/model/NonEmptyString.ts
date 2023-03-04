import z from 'zod'

export const nonEmptyStringSchema = z.string().min(1)
