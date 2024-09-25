
import { absoluteAmountSchema, assetSourceSchema, createStepSchema, EncodedWorkflowStep, EncodingContext, StepBase, stepProperties } from '@freemarket/core';
import { z } from 'zod';

export const renzoDepositEthForEzEthSchema = createStepSchema('renzo-deposit-eth').extend({
  ethToTrade: absoluteAmountSchema.describe(stepProperties('ethToTrade', 'ethToTrade')),
  minEzEthToReceive: absoluteAmountSchema.describe(stepProperties('minEzEthToReceive', 'minEzEthToReceive')),
  source: assetSourceSchema.describe(stepProperties('Source', 'sourceDescription')),
})

export interface RenzoDepositEthForEzEth extends z.infer<typeof renzoDepositEthForEzEthSchema> {}

