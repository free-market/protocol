// /* eslint-disable no-console */
// import z, { ZodType } from 'zod'
// import { Memoize } from 'typescript-memoize'
// import { promisify } from 'util'
// import { ZodObject, ZodTypeAny } from 'zod'
// import { addAssetSchema, assetAmountSchema, stepSchema } from './model'
// import { assetReferenceSchema } from './model/AssetReference'

// import { PARAMETER_REFERENCE_REGEXP } from './model/Parameter'
// import { MapWithDefault } from './utils/MapWithDefault'
// import assert from './utils/assert'
// const sleep = promisify(setTimeout)

// const myObjSchema = z.object({
//   aa: assetAmountSchema,
//   bb: assetAmountSchema.optional(),
//   cc: assetAmountSchema.optional(),
//   dd: z
//     .object({
//       ee: assetAmountSchema,
//     })
//     .optional(),
// })

// type MyObj = z.infer<typeof myObjSchema>

// const myObj: MyObj = {
//   aa: {
//     asset: {
//       type: 'fungible-token',
//       symbol: 'LINK',
//     },
//     amount: 99,
//   },
// }

// const myObj2: MyObj = {
//   aa: '{{asdf}}',
//   bb: '{{qwer}}',
//   cc: '{{asdf}}',
//   dd: {
//     ee: ' {{ asdf}}',
//   },
// }

// function getArgumentPaths(value: Record<string, any>): Map<string, string[][]> {
//   const map = new MapWithDefault<string, string[][]>(() => [])
//   function getArgs(value: Record<string, any>, currentPath: string[]) {
//     for (const attrName in value) {
//       const attrValue = value[attrName]
//       if (typeof attrValue === 'object') {
//         getArgs(attrValue, currentPath.concat([attrName]))
//       } else if (typeof attrValue === 'string') {
//         const matchResult = PARAMETER_REFERENCE_REGEXP.exec(attrValue)
//         if (matchResult) {
//           const paramName = matchResult[1]
//           const path = currentPath.concat([attrName])
//           map.getWithDefault(paramName).push(path)
//         }
//       }
//     }
//   }
//   getArgs(value, [])

//   return map
// }

// function doStuff(zodObject: ZodObject<any>) {
//   const shape = zodObject._def.shape()
//   console.log('zosObject shape', shape)
//   for (const attributeName of Object.keys(shape)) {
//     const attribute = shape[attributeName]
//     const attrInner = attribute._def.innerType
//     console.log(`  attr name=${attributeName} zodType=${attribute._def.typeName}`)
//   }
// }

// function getZodChild(obj: ZodObject<any>, path: string[]): ZodType<any> {
//   assert(path.length > 0)
//   const shape = obj._def.shape()
//   let child = shape[path[0]]
//   if (child._def.innerType) {
//     child = child._def.innerType
//   }
//   if (path.length === 1) {
//     return child
//   }
//   return getZodChild(child, path.slice(1))
// }

// function go() {
//   const mapVariableNameToPaths = getArgumentPaths(myObj2)
//   for (const [key, value] of mapVariableNameToPaths) {
//     console.log(key)
//     for (const path of value) {
//       console.log('  ' + JSON.stringify(path))
//       const zodType = getZodChild(myObjSchema, path) as any
//       console.log('  ' + zodType._parameterTypeName)
//     }
//   }

// }

// go()
