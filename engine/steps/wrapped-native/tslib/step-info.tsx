import * as React from 'react'
import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import WethIcon from './WethIcon'

export const platformInfo: PlatformInfo = {
  name: 'Wrapped Native',
  description: 'Wraps and unwraps native assets',
  icon: WethIcon,
  categories: ['Utilities'],
  stepInfos: [
    {
      stepType: 'wrap-native',
      nodeType: 'stepNode',
      name: 'Wrap Native',
      description: 'Exchanges native asset for wrapped asset',
      icon: WethIcon,
      platformName: 'Wrapped Native',
      summary: p => <span style={{ ...p.infoStyle }}>{p.step.amount}</span>,
    },
    {
      stepType: 'unwrap-native',
      nodeType: 'stepNode',
      name: 'Unwrap Native',
      description: 'Exchanges a wrapped asset for a native asset',
      icon: WethIcon,
      platformName: 'Wrapped Native',
      summary: p => <span style={{ ...p.infoStyle }}>{p.step.amount}</span>,
    },
  ],
}
