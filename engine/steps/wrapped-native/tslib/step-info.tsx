import * as React from 'react'
import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import WethIcon from './WethIcon'
import { WRAP_NATIVE_STEP_TYPE_ID } from './wrap-native-helper'

export const platformInfo: PlatformInfo = {
  name: 'Wrapped Native',
  description: 'Wraps and unwraps native assets',
  icon: WethIcon,
  categories: ['Utilities'],
  stepInfos: [
    {
      stepType: 'wrap-native',
      stepTypeId: WRAP_NATIVE_STEP_TYPE_ID,
      nodeType: 'stepNode',
      name: 'Wrap Native',
      operation: 'Wrap',
      description: 'Exchanges native asset for wrapped asset',
      icon: WethIcon,
      platformName: 'Wrapped Native',
      summary: p => <span style={{ ...p.infoStyle }}>{p.step.amount}</span>,
    },
    {
      stepType: 'unwrap-native',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Unwrap Native',
      operation: 'Unwrap',
      description: 'Exchanges a wrapped asset for a native asset',
      icon: WethIcon,
      platformName: 'Wrapped Native',
      summary: p => <span style={{ ...p.infoStyle }}>{p.step.amount}</span>,
    },
  ],
}
