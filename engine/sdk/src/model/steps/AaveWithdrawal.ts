import z from 'zod'
import { assetAmountSchema } from '../AssetAmount'
import { createStepSchema } from '../StepBase'

export const aaveWithdrawalSchema = createStepSchema('aave-withdrawal').extend({
  inputAsset: assetAmountSchema.describe('The asset to withdrawal from Aave.'),
})

export type AaveWithdrawal = z.infer<typeof aaveWithdrawalSchema>
