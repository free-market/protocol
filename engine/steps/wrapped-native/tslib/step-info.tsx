import * as React from 'react'
import { PlatformInfo, StepInfo, formatNumber } from '@freemarket/step-sdk'
import WethIcon from './WethIcon'
import { STEP_TYPE_ID_WRAP_NATIVE } from './wrap-native-helper'
import { STEP_TYPE_ID_UNWRAP_NATIVE } from './unwrap-native-helper'

export const platformInfo: PlatformInfo = {
  name: 'Wrapped Native',
  description: 'Wraps and unwraps native assets',
  icon: WethIcon,
  categories: ['Utilities'],
  stepInfos: [
    {
      stepType: 'wrap-native',
      stepTypeId: STEP_TYPE_ID_WRAP_NATIVE,
      nodeType: 'stepNode',
      name: 'Wrap Native',
      operation: 'Wrap',
      description: 'Exchanges native asset for wrapped asset',
      icon: WethIcon,
      platformName: 'Wrapped Native',
      summary: p => (
        <div style={{ display: 'flex' }}>
          <span style={{ ...p.labelStyle }}>amount: </span>
          <span style={{ ...p.infoStyle }}>{p.step.amount}</span>
        </div>
      ),
    },
    {
      stepType: 'unwrap-native',
      stepTypeId: STEP_TYPE_ID_UNWRAP_NATIVE,
      nodeType: 'stepNode',
      name: 'Unwrap Native',
      operation: 'Unwrap',
      description: 'Exchanges a wrapped asset for a native asset',
      icon: WethIcon,
      platformName: 'Wrapped Native',
      summary: p => (
        <div style={{ display: 'flex' }}>
          <span style={{ ...p.labelStyle }}>amount: </span>
          <span style={{ ...p.infoStyle }}>{p.step.amount}</span>
        </div>
      ),
    },
  ],
}
