import type z from 'zod'
import { amountSchema, assetReferenceSchema, addressSchema, createStepSchema } from '@freemarket/core'

export const addAssetSchema = createStepSchema('add-asset')
  .extend({
    asset: assetReferenceSchema.describe('asset to be added to the workflow'),
    amount: amountSchema.describe('amount of asset to be added to the workflow'),
    fromAddress: addressSchema.optional().describe('the address from which the asset will be transferred'),
  })
  .describe('Adds an asset to the workflow.')

export interface AddAsset extends z.infer<typeof addAssetSchema> {}
