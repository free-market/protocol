import { StepInfo } from '@freemarket/step-sdk'
import AaveIcon from './AaveIcon'

export const stepInfos: StepInfo[] = [
  {
    stepType: 'aave-supply',
    nodeType: 'stepNode',
    name: 'Aave Supply',
    description: 'Deposit an asset into Aave',
    platform: 'Aave',
    categories: ['Lending', 'Yield'],
    icon: AaveIcon,
  },
  {
    stepType: 'aave-withdrawal',
    nodeType: 'stepNode',
    name: 'Aave Withdrawal',
    description: 'Withdrawal an asset from Aave',
    platform: 'Aave',
    categories: ['Lending', 'Yield'],
    icon: AaveIcon,
  },
  {
    stepType: 'aave-borrow',
    nodeType: 'stepNode',
    name: 'Aave Borrow',
    description: 'Borrow an asset from Aave',
    platform: 'Aave',
    categories: ['Lending'],
    icon: AaveIcon,
  },
  {
    stepType: 'aave-repay',
    nodeType: 'stepNode',
    name: 'Aave Repay',
    description: 'Repay an asset borrowed from Aave',
    platform: 'Aave',
    categories: ['Lending'],
    icon: AaveIcon,
  },
  {
    stepType: 'aave-flash-loan',
    nodeType: 'stepNode',
    name: 'Aave Flash Loan',
    description: 'Perform an Aave flash loan',
    platform: 'Aave',
    categories: ['Lending'],
    icon: AaveIcon,
  },
]
