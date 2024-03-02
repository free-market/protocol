import type z from 'zod'
import { amountSchema, assetReferenceSchema, createStepSchema, stepProperties } from '@freemarket/core'

export const addAssetSchema = createStepSchema('add-asset')
  .extend({
    asset: assetReferenceSchema.describe(stepProperties('Asset', 'asset to be added to the workflow')),
    amount: amountSchema.describe(stepProperties('Amount', 'amount of asset to be added to the workflow')),
  })
  .describe('Adds an asset to the workflow.')

export interface AddAsset extends z.infer<typeof addAssetSchema> {}
