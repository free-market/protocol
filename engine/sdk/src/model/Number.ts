import Big from 'big.js'
// import { mixed, string } from 'yup'

export type NumberType = number | string

// export const numberSchema = string()
//   .defined()
//   .matches(/^\d+(\.\d+)?$/)
// export const numberSchema = mixed((input): input is Big => input instanceof Big).transform((value: any) => {
//   if (value instanceof Big) {
//     return value
//   }
//   return new Big(value)
// })

// await objectIdSchema.validate(ObjectId('507f1f77bcf86cd799439011')) // ObjectId("507f1f77bcf86cd799439011")

// await objectIdSchema.validate('507f1f77bcf86cd799439011') // ObjectId("507f1f77bcf86cd799439011")

// InferType<typeof objectIdSchema> // ObjectId
