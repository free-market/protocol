import z from 'zod'
import { amountSchema, createStepSchema, assetReferenceSchema, stepProperties, assetSourceSchema } from '@freemarket/core'
import { assetSourceDescription } from '@freemarket/step-sdk'

const sourceDescription = `The source of the asset. ${assetSourceDescription} `

export const aaveSupplySchema = createStepSchema('aave-supply')
  .describe('Performs a deposit into Aave.  Deposited assets can be used as collateral to borrow other assets.  They also earn interest.')
  .extend({
    asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to deposit into Aave.')),
    amount: amountSchema.describe(stepProperties('Amount', 'The amount of the asset to deposit into Aave.')),
    source: assetSourceSchema.describe(stepProperties('Source', sourceDescription)),
  })

export interface AaveSupply extends z.infer<typeof aaveSupplySchema> {}

export const aaveWithdrawalSchema = createStepSchema('aave-withdrawal')
  .describe('Withdraws assets from Aave.')
  .extend({
    asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to withdrawal from Aave.')),
    amount: amountSchema.describe(stepProperties('Amount', 'The asset to withdrawal from Aave.')),
    source: assetSourceSchema.describe(stepProperties('Source', sourceDescription)),
  })

export interface AaveWithdrawal extends z.infer<typeof aaveWithdrawalSchema> {}

export const aaveInterestRateModeSchema = z.enum(['stable', 'variable'])

export type AaveInterestRateMode = z.infer<typeof aaveInterestRateModeSchema>

export const aaveBorrowSchema = createStepSchema('aave-borrow').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to borrow from Aave.')),
  amount: amountSchema.describe(stepProperties('Amount', 'The amount of the asset to borrow from Aave.')),
  interestRateMode: aaveInterestRateModeSchema.describe(
    stepProperties('Interest Rate Mode', 'The interest rate mode to use for the borrow.')
  ),
})

export interface AaveBorrow extends z.infer<typeof aaveBorrowSchema> {}

export const aaveRepaySchema = createStepSchema('aave-repay').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to repay to Aave.')),
  amount: amountSchema.describe(stepProperties('Amount', 'The amount of the asset to repay to Aave.')),
  source: assetSourceSchema.describe(stepProperties('Source', sourceDescription)),
  interestRateMode: aaveInterestRateModeSchema.describe(
    stepProperties('Interest Rate Mode', 'The interest rate mode of the debt being repaid.')
  ),
})

export interface AaveRepay extends z.infer<typeof aaveRepaySchema> {}

export const aaveFlashLoanSchema = createStepSchema('aave-flash-loan').extend({
  asset: assetReferenceSchema.describe(stepProperties('Asset', 'The asset to borrow from Aave.')),
  amount: amountSchema.describe(stepProperties('Amount', 'The amount of the asset to borrow from Aave.')),
  source: assetSourceSchema.describe(stepProperties('Source', sourceDescription)),
})

export interface AaveFlashLoan extends z.infer<typeof aaveFlashLoanSchema> {}
