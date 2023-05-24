import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import CurveIcon from './CurveIcon'
import { STEP_TYPE_ID } from './helper'

export const platformInfo: PlatformInfo = {
  name: 'Curve',
  description: 'Automated market maker (AMM) provides swapping assets with low fees and low slippage.',
  icon: CurveIcon,
  categories: ['Swapping', 'Yield'],
  stepInfos: [
    {
      stepType: 'curve-tricrypto2-swap',
      stepTypeId: STEP_TYPE_ID,
      nodeType: 'stepNode',
      name: 'Curve Tricrypto2 Swap',
      description: 'Allows swapping between WETH, WBTC, and USDT',
      icon: CurveIcon,
      platformName: 'Curve',
    },
    {
      stepType: 'curve-tricrypto2-deposit',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Curve Tricrypto2 Deposit',
      description: 'Deposit WETH, WBTC, or USDT into Tricrypto2',
      icon: CurveIcon,
      comingSoon: true,
      platformName: 'Curve',
    },
    {
      stepType: 'curve-tricrypto2-withdrawal',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Curve Tricrypto2 Withdrawal',
      description: 'Withdrawal WETH, WBTC, or USDT from Tricrypto2',
      icon: CurveIcon,
      comingSoon: true,
      platformName: 'Curve',
    },
    {
      stepType: 'curve-tricrypto2-stake',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Curve Tricrypto2 Stake',
      description: 'Stake Tricrypto2 LP tokens to earn CRV',
      icon: CurveIcon,
      comingSoon: true,
      platformName: 'Curve',
    },
    {
      stepType: 'curve-tricrypto2-unstake',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Curve Tricrypto2 Unstake',
      description: 'Unstake CRV tokens from Tricrypto2',
      icon: CurveIcon,
      comingSoon: true,
      platformName: 'Curve',
    },
  ],
}
