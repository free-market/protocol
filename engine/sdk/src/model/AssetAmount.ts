// import Big from 'big.js'
// import { boolean, mixed, ObjectSchema, string, object } from 'yup'
import { NumberType } from './Number'

export interface AssetAmount {
  symbol: string
  amount: NumberType
}

// export const assetAmountSchema: ObjectSchema<AssetAmount> = object({
//   symbol: string().required(),
//   amount: numberSchema.required(),
// })
