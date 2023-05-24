import type z from 'zod'
import { amountSchema, createStepSchema, assetReferenceSchema, stepProperties, assetSourceSchema } from '@freemarket/core'

export const aaveSupplySchema = createStepSchema('aave-supply').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to deposit into Aave.')),
  amount: amountSchema.describe(stepProperties('Amount', 'The asset to deposit into Aave.')),
  source: assetSourceSchema.describe(stepProperties('Source', 'The source of the asset.')),
})

export interface AaveSupply extends z.infer<typeof aaveSupplySchema> {}

export const aaveWithdrawalSchema = createStepSchema('aave-withdrawal').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to withdrawal from Aave.')),
  amount: amountSchema.describe(stepProperties('Amount', 'The asset to withdrawal from Aave.')),
  source: assetSourceSchema.describe(stepProperties('Source', 'The source of the asset.')),
})

export interface AaveWithdrawal extends z.infer<typeof aaveWithdrawalSchema> {}

export const aaveBorrowSchema = createStepSchema('aave-borrow').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to borrow from Aave.')),
  amount: amountSchema.describe(stepProperties('Amount', 'The asset to borrow from Aave.')),
  source: assetSourceSchema.describe(stepProperties('Source', 'The source of the asset.')),
})

export interface AaveBorrow extends z.infer<typeof aaveBorrowSchema> {}

export const aaveRepaySchema = createStepSchema('aave-repay').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to repay to Aave.')),
  amount: amountSchema.describe(stepProperties('Amount', 'The asset to repay to Aave.')),
  source: assetSourceSchema.describe(stepProperties('Source', 'The source of the asset.')),
})

export interface AaveRepay extends z.infer<typeof aaveRepaySchema> {}

export const aaveFlashLoanSchema = createStepSchema('aave-flash-loan').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to borrow from Aave.')),
  amount: amountSchema.describe(stepProperties('Amount', 'The asset to borrow from Aave.')),
  source: assetSourceSchema.describe(stepProperties('Source', 'The source of the asset.')),
})

export interface AaveFlashLoan extends z.infer<typeof aaveFlashLoanSchema> {}
