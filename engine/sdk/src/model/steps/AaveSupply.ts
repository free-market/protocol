import z from 'zod'
import { assetAmountSchema } from '../AssetAmount'
import { createStepSchema } from '../StepBase'

export const aaveSupplySchema = createStepSchema('aave-supply').extend({
  inputAsset: assetAmountSchema,
})

export type AaveSupply = z.infer<typeof aaveSupplySchema>
