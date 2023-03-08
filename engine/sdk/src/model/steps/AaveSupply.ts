import z from 'zod'
import { assetAmountSchema } from '../AssetAmount'
import { createStepSchema } from '../StepBase'

export const aaveSupplySchema = createStepSchema('aave-supply').extend({
  inputAsset: assetAmountSchema,
})

export interface AaveSupply extends z.infer<typeof aaveSupplySchema> {}
