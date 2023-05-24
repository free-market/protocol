import * as React from 'react'
import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import AddAssetIcon from './AddAssetIcon'
import StepSummary from './StepSummary'
import { STEP_TYPE_ID } from './helper'

export const platformInfo: PlatformInfo = {
  name: 'Add Asset',
  description: 'Adds an asset to the workflow',
  icon: AddAssetIcon,
  categories: ['Utilities'],
  stepInfos: [
    {
      stepType: 'add-asset',
      stepTypeId: STEP_TYPE_ID,
      nodeType: 'stepNode',
      name: 'Add Asset',
      description: 'Adds an asset to the workflow',
      icon: AddAssetIcon,
      summary: StepSummary,
    },
  ],
}
