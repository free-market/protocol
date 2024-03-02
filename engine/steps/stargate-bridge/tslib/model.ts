import type z from 'zod'
import {
  amountSchema,
  assetSourceSchema,
  chainSchema,
  addressSchema,
  createStepSchema,
  assetReferenceSchema,
  stepProperties,
  percentSchema,
} from '@freemarket/core'

export const stargateBridgeSchema = createStepSchema('stargate-bridge').extend({
  destinationChain: chainSchema.describe(stepProperties('Destination Chain', 'The chain to send the asset to')),
  inputAsset: assetReferenceSchema.describe(stepProperties('Input Asset', 'The asset to send to the destination chain')),
  inputAmount: amountSchema.describe(stepProperties('Input Amount', 'The amount of the input asset to send to the destination chain')),
  inputSource: assetSourceSchema.describe(stepProperties('Input Source', 'The source of the input asset.')),

  maxSlippagePercent: percentSchema.describe(stepProperties('Max Slippage', 'The maximum amount of loss during the swap.')),
  outputAsset: assetReferenceSchema
    .optional()
    .describe(stepProperties('Output Asset', 'The asset to receive from the destination chain (if different from the input asset)')),
  destinationGasUnits: amountSchema.describe(
    stepProperties('Dest. Gas Units', 'Gas units required to execute the workflow on the destination chain')
  ),
  destinationUserAddress: addressSchema
    .optional()
    .describe(stepProperties('Dest. User Address', 'The address of the user on the destination chain')),
  destinationAdditionalNative: amountSchema
    .optional()
    .describe(stepProperties('Additional Native', 'Additional native asset to send to the destination user address')),
  remittanceSource: assetSourceSchema.default('caller').describe(stepProperties('Remittance Source', 'The source of the remittance')),
  // includeContinuationWorkflowInEvent: z.boolean().default(false).describe(stepProperties('Include Continuation Workflow', 'Include the continuation workflow in the event')),
})

export interface StargateBridge extends z.infer<typeof stargateBridgeSchema> {}
