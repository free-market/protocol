import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import OneInchIcon from './branding-assets/OneInchIcon'

export const oneInchPlatformInfo: PlatformInfo = {
  name: 'One Inch',
  description: 'Decentralized exchange aggregator',
  icon: OneInchIcon,
  categories: ['Swapping'],
  stepInfos: [
    {
      stepType: 'oneInch',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: '1 Inch',
      description: 'Swap tokens using 1 Inch',
      icon: OneInchIcon,
      summary: OneInchIcon,
      comingSoon: true,
    },
  ],
}
