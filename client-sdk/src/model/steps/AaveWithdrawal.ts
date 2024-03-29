import type z from 'zod'
import { assetAmountSchema, createStepSchema } from '@freemarket/core'

export const aaveWithdrawalSchema = createStepSchema('aave-withdrawal').extend({
  inputAsset: assetAmountSchema.describe('The asset to withdrawal from Aave.'),
})

export type AaveWithdrawal = z.infer<typeof aaveWithdrawalSchema>
