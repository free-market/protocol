import { StepInfo } from '@freemarket/step-sdk'
import AaveIcon from './AaveIcon'

export const stepInfo: StepInfo = {
  stepType: 'aave-supply',
  nodeType: 'stepNode',
  name: 'Aave Supply',
  description: 'Deposit an asset into Aave',
  platform: 'Aave',
  categories: ['Lending', 'Staking'],
  icon: AaveIcon,
}
