import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import CurveIcon from './CurveIcon'

export const platformInfos: PlatformInfo = {
  name: 'Curve',
  description: 'Automated market maker (AMM) provides swapping assets with low fees and low slippage.',
  icon: CurveIcon,
  categories: ['Swapping', 'Yield'],
  stepInfos: [
    {
      stepType: 'curve-tricrypto2-swap',
      nodeType: 'stepNode',
      name: 'Curve Tricrypto2 Swap',
      description: 'Allows swapping between WETH, WBTC, and USDT',
      icon: CurveIcon,
    },
    {
      stepType: 'curve-tricrypto2-deposit',
      nodeType: 'stepNode',
      name: 'Curve Tricrypto2 Deposit',
      description: 'Deposit WETH, WBTC, or USDT into Tricrypto2',
      icon: CurveIcon,
      comingSoon: true,
    },
    {
      stepType: 'curve-tricrypto2-withdrawal',
      nodeType: 'stepNode',
      name: 'Curve Tricrypto2 Withdrawal',
      description: 'Withdrawal WETH, WBTC, or USDT from Tricrypto2',
      icon: CurveIcon,
      comingSoon: true,
    },
    {
      stepType: 'curve-tricrypto2-stake',
      nodeType: 'stepNode',
      name: 'Curve Tricrypto2 Stake',
      description: 'Stake Tricrypto2 LP tokens to earn CRV',
      icon: CurveIcon,
      comingSoon: true,
    },
    {
      stepType: 'curve-tricrypto2-unstake',
      nodeType: 'stepNode',
      name: 'Curve Tricrypto2 Unstake',
      description: 'Unstake CRV tokens from Tricrypto2',
      icon: CurveIcon,
      comingSoon: true,
    },
  ],
}
