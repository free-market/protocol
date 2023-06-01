import type z from 'zod'
import { amountSchema, createStepSchema, assetReferenceSchema, stepProperties, assetSourceSchema } from '@freemarket/core'

export const phiatSupplySchema = createStepSchema('phiat-supply').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to deposit into Phiat.')),
  amount: amountSchema.describe(stepProperties('Amount', 'The asset to deposit into Phiat.')),
  source: assetSourceSchema.describe(stepProperties('Source', 'The source of the asset.')),
})

export interface PhiatSupply extends z.infer<typeof phiatSupplySchema> {}

export const phiatWithdrawalSchema = createStepSchema('phiat-withdrawal').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to withdrawal from Phiat.')),
  amount: amountSchema.describe(stepProperties('Amount', 'The asset to withdrawal from Phiat.')),
  source: assetSourceSchema.describe(stepProperties('Source', 'The source of the asset.')),
})

export interface PhiatWithdrawal extends z.infer<typeof phiatWithdrawalSchema> {}

export const phiatBorrowSchema = createStepSchema('phiat-borrow').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to borrow from Phiat.')),
  amount: amountSchema.describe(stepProperties('Amount', 'The asset to borrow from Phiat.')),
  source: assetSourceSchema.describe(stepProperties('Source', 'The source of the asset.')),
})

export interface PhiatBorrow extends z.infer<typeof phiatBorrowSchema> {}

export const phiatRepaySchema = createStepSchema('phiat-repay').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to repay to Phiat.')),
  amount: amountSchema.describe(stepProperties('Amount', 'The asset to repay to Phiat.')),
  source: assetSourceSchema.describe(stepProperties('Source', 'The source of the asset.')),
})

export interface PhiatRepay extends z.infer<typeof phiatRepaySchema> {}

export const phiatFlashLoanSchema = createStepSchema('phiat-flash-loan').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to borrow from Phiat.')),
  amount: amountSchema.describe(stepProperties('Amount', 'The asset to borrow from Phiat.')),
  source: assetSourceSchema.describe(stepProperties('Source', 'The source of the asset.')),
})

export interface PhiatFlashLoan extends z.infer<typeof phiatFlashLoanSchema> {}
