import type { PreviousOutputBranch } from './model'
import { EncodedWorkflowStep, EncodingContext } from '@freemarket/core'

import { AssetComparisonHelperBase } from './AssetComparisonHelperBase'

export const STEP_TYPE_ID_PREV_OUTPUT_BRANCH = 3

export class PreviousOutputBranchHelper extends AssetComparisonHelperBase {
  async encodeWorkflowStep(context: EncodingContext<PreviousOutputBranch>): Promise<EncodedWorkflowStep> {
    return this.encodeWorkflowStepForStepId(context, STEP_TYPE_ID_PREV_OUTPUT_BRANCH)
  }
}
