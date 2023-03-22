import type z from 'zod'
import { assetAmountSchema, createStepSchema } from '@freemarket/core'

export const aaveSupplySchema = createStepSchema('aave-supply').extend({
  inputAsset: assetAmountSchema,
})

export interface AaveSupply extends z.infer<typeof aaveSupplySchema> {}
