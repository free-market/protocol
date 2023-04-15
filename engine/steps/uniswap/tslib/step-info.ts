import { StepInfo } from '@freemarket/step-sdk'
import UniswapIcon from './UniswapIcon'

export const stepInfo: StepInfo = {
  stepType: 'uniswap-swap',
  nodeType: 'stepNode',
  name: 'Uniswap Swap',
  description: 'Exchanges an asset for another asset on Uniswap',
  platform: 'Uniswap',
  categories: ['Swapping'],
  icon: UniswapIcon,
}
