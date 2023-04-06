import type z from 'zod'
import { assetAmountSchema, createStepSchema } from '@freemarket/core'

export const aaveSupplySchema = createStepSchema('aave-supply').extend({
  inputAsset: assetAmountSchema,
})

export interface AaveSupply extends z.infer<typeof aaveSupplySchema> {}

export const aaveWithdrawalSchema = createStepSchema('aave-withdrawal').extend({
  inputAsset: assetAmountSchema.describe('The asset to withdrawal from Aave.'),
})

export type AaveWithdrawal = z.infer<typeof aaveWithdrawalSchema>
