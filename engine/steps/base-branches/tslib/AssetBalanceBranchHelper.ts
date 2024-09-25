import type { AssetBalanceBranch } from './model'
import { EncodedWorkflowStep, EncodingContext } from '@freemarket/core'

import { AssetComparisonHelperBase } from './AssetComparisonHelperBase'
import { STEP_TYPE_ID_ASSET_BALANCE_BRANCH } from '@freemarket/core/tslib/step-ids'

export class AssetBalanceBranchHelper extends AssetComparisonHelperBase {
  async encodeWorkflowStep(context: EncodingContext<AssetBalanceBranch>): Promise<EncodedWorkflowStep> {
    return this.encodeWorkflowStepForStepId(context, STEP_TYPE_ID_ASSET_BALANCE_BRANCH)
  }
}
