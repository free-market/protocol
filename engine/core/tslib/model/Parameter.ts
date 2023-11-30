import z, { ZodType, ZodTypeAny } from 'zod'
import { assert } from '../utils/assert'
import { nonEmptyStringSchema } from './NonEmptyString'

export const PARAMETER_NAME_REGEX = '[a-zA-Z0-9-. ]+'
export const PARAMETER_NAME_REGEXP = new RegExp(PARAMETER_NAME_REGEX)
export const parameterNameSchema = z.string().regex(PARAMETER_NAME_REGEXP)

export const PARAMETER_REFERENCE_REGEX = `^ *{{ *(${PARAMETER_NAME_REGEX}) }} *$`

export const PARAMETER_REFERENCE_REGEXP = new RegExp(PARAMETER_REFERENCE_REGEX)
export const parameterReferenceSchema = z.string().regex(PARAMETER_REFERENCE_REGEXP)

export const PARAMETER_TYPES = [
  'amount',
  'absolute-amount',
  'percent-amount',
  'address',
  'asset-ref',
  'asset-source',
  'asset-amount',
  'number',
  'percent',
] as const
export const parameterTypeSchema = z.enum(PARAMETER_TYPES)

export type ParameterType = z.infer<typeof parameterTypeSchema>

export const parameterSchema = z.object({
  name: nonEmptyStringSchema.regex(new RegExp(PARAMETER_NAME_REGEX)),
  label: z.string().optional(),
  description: z.string().optional(),
  type: parameterTypeSchema,
})

export interface Parameter extends z.infer<typeof parameterSchema> {}

const parameterTypeRegistry = new Map<string, ZodTypeAny>()

export function registerParameterType<T>(parameterTypeName: ParameterType, obj: ZodType<T>) {
  parameterTypeRegistry.set(parameterTypeName, obj)
  const rv = obj.or(parameterReferenceSchema)
  const rvAsAny = rv as any
  rvAsAny._def._parameterTypeName = parameterTypeName
  return rv
}

export function getParameterSchema(parameterTypeName: ParameterType): ZodTypeAny {
  const rv = parameterTypeRegistry.get(parameterTypeName)
  assert(rv)
  return rv
}

export type Foo = 'Foo'
