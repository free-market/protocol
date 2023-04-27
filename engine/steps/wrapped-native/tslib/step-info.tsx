import * as React from 'react'
import { StepInfo } from '@freemarket/step-sdk'
import WethIcon from './WethIcon'

export const stepInfos: StepInfo[] = [
  {
    stepType: 'wrap-native',
    nodeType: 'stepNode',
    name: 'Wrap Native',
    description: 'Exchanges native asset for wrapped asset',
    // platform: 'No Platform',
    categories: ['Utilities'],
    icon: WethIcon,
    summary: p => <span style={{ ...p.infoStyle }}>{p.step.amount}</span>,
  },
  {
    stepType: 'unwrap-native',
    nodeType: 'stepNode',
    name: 'Unwrap Native',
    description: 'Exchanges a wrapped asset for a native asset',
    // platform: 'No Platform',
    categories: ['Utilities'],
    icon: WethIcon,
    summary: p => <span style={{ ...p.infoStyle }}>{p.step.amount}</span>,
  },
]
