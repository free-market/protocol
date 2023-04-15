import { StepInfo } from '@freemarket/step-sdk'
import WethIcon from './WethIcon'

export const wrapNativeStepInfo: StepInfo = {
  stepType: 'wrap-native',
  nodeType: 'stepNode',
  name: 'Wrap Native',
  description: 'Exchanges native asset for wrapped asset',
  platform: 'None',
  categories: ['Utilities'],
  icon: WethIcon,
}
export const unwrapNativeStepInfo: StepInfo = {
  stepType: 'unwrap-native',
  nodeType: 'stepNode',
  name: 'Unwrap Native',
  description: 'Exchanges a wrapped asset for a native asset',
  platform: 'None',
  categories: ['Utilities'],
  icon: WethIcon,
}
