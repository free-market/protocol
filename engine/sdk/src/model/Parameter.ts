import z, { ZodType, ZodTypeAny } from 'zod'
import { nonEmptyStringSchema } from './NonEmptyString'

// part of the static definition of a workflow
export const PARAMETER_NAME_REGEX = '[a-zA-Z0-9-.]+'
export const PARAMETER_REFERENCE_REGEX = `^ *{{ *(${PARAMETER_NAME_REGEX}) *}} *$`
export const PARAMETER_REFERENCE_REGEXP = new RegExp(PARAMETER_REFERENCE_REGEX)
export const parameterReferenceSchema = z.string().regex(PARAMETER_REFERENCE_REGEXP)

export const PARAMETER_TYPES = ['amount', 'address', 'asset', 'asset-amount'] as const
export const parameterTypeSchema = z.enum(PARAMETER_TYPES)

export type ParameterType = z.infer<typeof parameterTypeSchema>

export const parameterSchema = z.object({
  name: nonEmptyStringSchema.regex(new RegExp(PARAMETER_NAME_REGEX)),
  description: z.string().optional(),
  type: parameterTypeSchema,
})

const parameterTypeRegistry = new Map<string, ZodTypeAny>()

export function registerParameterType<T>(parameterTypeName: ParameterType, obj: ZodType<T>) {
  parameterTypeRegistry.set(parameterTypeName, obj)
  const rv = obj.or(parameterReferenceSchema)
  const rvAsAny = rv as any
  rvAsAny._parameterTypeName = parameterTypeName
  return rv
}

// export const amountParameterSchema = parameterBaseSchema.extend({
//   type: z.literal('amount'),
//   amount: amountSchema,
// })
// export interface AmountParameter extends z.infer<typeof amountParameterSchema> {}

// export const addressParameterSchema = parameterBaseSchema.extend({
//   type: z.literal('address'),
//   address: hexStringSchema,
// })
// export interface AddressParameter extends z.infer<typeof addressParameterSchema> {}

// export const assetParameterSchema = parameterBaseSchema.extend({
//   type: z.literal('asset'),
//   asset: assetSchema,
// })
// export interface AssetParameter extends z.infer<typeof assetParameterSchema> {}

// export const assetAmountParameterSchema = parameterBaseSchema.extend({
//   type: z.literal('asset-amount'),
//   assetAmount: assetAmountSchema,
// })

// export interface AssetAmountParameter extends z.infer<typeof assetAmountParameterSchema> {}

// export const parameterSchema = z.discriminatedUnion('type', [
//   amountParameterSchema,
//   addressParameterSchema,
//   assetParameterSchema,
//   assetAmountParameterSchema,
// ])

// export type Parameter = z.infer<typeof parameterSchema>
