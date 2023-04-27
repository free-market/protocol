import * as React from 'react'
import { StepInfo } from '@freemarket/step-sdk'
import AddAssetIcon from './AddAssetIcon'
import StepSummary from './StepSummary'

export const stepInfos: StepInfo[] = [
  {
    stepType: 'add-asset',
    nodeType: 'stepNode',
    name: 'Add Asset',
    description: 'Adds an asset to the workflow',
    categories: ['Utilities'],
    icon: AddAssetIcon,
    summary: StepSummary,
  },
]
