import z from 'zod'
import { absoluteAmountSchema } from '../Amount'
import { assetReferenceSchema } from '../AssetReference'
import { hexStringSchema } from '../HexString'
import { createStepSchema } from '../StepBase'

export const addAssetSchema = createStepSchema('add-asset')
  .extend({
    asset: assetReferenceSchema.describe('asset to be added to the workflow'),
    amount: absoluteAmountSchema.describe('amount of asset to be added to the workflow'),
    fromAddress: hexStringSchema.optional().describe('the address from which the asset will be transferred'),
  })
  .describe('Adds an asset to the workflow.')

export interface AddAsset extends z.infer<typeof addAssetSchema> {}
