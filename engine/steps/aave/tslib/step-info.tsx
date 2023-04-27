import * as React from 'react'
import { StepInfo } from '@freemarket/step-sdk'
import AaveIcon from './AaveIcon'
import AssetReferenceView from '@freemarket/step-sdk/build/tslib/helpers/AssetReferenceView'

function AaveSummary(props: any) {
  return (
    <span style={{ ...props.labelStyle }}>
      {props.operation}&nbsp;
      <span style={{ ...props.infoStyle }}>
        {props.step.amount.toString()}
        &nbsp;
        <AssetReferenceView assetRef={props.step.asset} />
      </span>
    </span>
  )
}

export const stepInfos: StepInfo[] = [
  {
    stepType: 'aave-supply',
    nodeType: 'stepNode',
    name: 'Aave Supply',
    description: 'Deposit an asset into Aave',
    platform: 'Aave',
    categories: ['Lending', 'Yield'],
    icon: AaveIcon,
    operation: 'Supply',
    summary: p => <AaveSummary {...p} operation="Supply" />,
  },
  {
    stepType: 'aave-withdrawal',
    nodeType: 'stepNode',
    name: 'Aave Withdrawal',
    description: 'Withdrawal an asset from Aave',
    platform: 'Aave',
    categories: ['Lending', 'Yield'],
    icon: AaveIcon,
    operation: 'Withdrawal',
    comingSoon: true,
    summary: p => <AaveSummary {...p} operation="Withdrawal" />,
  },
  {
    stepType: 'aave-borrow',
    nodeType: 'stepNode',
    name: 'Aave Borrow',
    description: 'Borrow an asset from Aave',
    platform: 'Aave',
    categories: ['Lending'],
    icon: AaveIcon,
    operation: 'Borrow',
    comingSoon: true,
    summary: p => <AaveSummary {...p} operation="Borrow" />,
  },
  {
    stepType: 'aave-repay',
    nodeType: 'stepNode',
    name: 'Aave Repay',
    description: 'Repay an asset borrowed from Aave',
    platform: 'Aave',
    categories: ['Lending'],
    icon: AaveIcon,
    operation: 'Repay',
    comingSoon: true,
    summary: p => <AaveSummary {...p} operation="Repay" />,
  },
  {
    stepType: 'aave-flash-loan',
    nodeType: 'stepNode',
    name: 'Aave Flash Loan',
    description: 'Perform an Aave flash loan',
    platform: 'Aave',
    categories: ['Lending'],
    icon: AaveIcon,
    operation: 'Flash Loan',
    comingSoon: true,
    summary: p => <AaveSummary {...p} operation="Flash Loan" />,
  },
]
