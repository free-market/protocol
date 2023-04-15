import { StepInfo } from '@freemarket/step-sdk'
import CurveIcon from './CurveIcon'

export const stepInfo: StepInfo = {
  stepType: 'curve-tricrypto2-swap',
  nodeType: 'stepNode',
  name: 'Curve Tricrypto2 Swap',
  description: 'Allows swapping between WETH, WBTC, and USDT',
  platform: 'Curve',
  categories: ['Swapping'],
  icon: CurveIcon,
}
