import { StepInfo } from '@freemarket/step-sdk'
import StargateIcon from './StargateIcon'

export const stepInfo: StepInfo = {
  stepType: 'stargate-bridge',
  nodeType: 'stepNode',
  name: 'Stargate Bridge',
  description: 'Moves an asset between chains',
  platform: 'Stargate',
  categories: ['Bridging'],
  icon: StargateIcon,
}
