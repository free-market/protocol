import * as React from 'react'
import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import AaveIcon from './AaveIcon'
import AssetReferenceView from '@freemarket/step-sdk/build/tslib/helpers/AssetReferenceView'
import { STEP_TYPE_ID_AAVE_SUPPLY } from './supply-helper'
import { STEP_TYPE_ID_AAVE_BORROW } from './borrow-helper'
import { STEP_TYPE_ID_AAVE_REPAY } from './repay-helper'

function AaveSummary(props: any) {
  return (
    <span style={{ ...props.labelStyle }}>
      {props.operation}&nbsp;
      <span style={{ ...props.infoStyle }}>
        {props.step.amount && props.step.amount.toString()}
        {props.step.amount && <span>&nbsp;</span>}
        <AssetReferenceView assetRef={props.step.asset} />
      </span>
    </span>
  )
}

function AaveLoanHealth(props: any) {
  return (
    <span style={{ ...props.labelStyle }}>
      <span style={{ ...props.infoStyle }}>
        <AssetReferenceView assetRef={props.step.asset} />
      </span>
      <span style={{ ...props.labelStyle }}>&nbsp;health below&nbsp;</span>
      <span style={{ ...props.infoStyle }}>{props.step.threshold}</span>
    </span>
  )
}

export const platformInfo: PlatformInfo = {
  name: 'Aave',
  description: "Web3's most popular lending protocol",
  icon: AaveIcon,
  categories: ['Lending', 'Yield'],

  stepInfos: [
    {
      stepType: 'aave-supply',
      stepTypeId: STEP_TYPE_ID_AAVE_SUPPLY,
      nodeType: 'stepNode',
      name: 'Aave Supply',
      description: 'Deposit an asset into Aave',
      icon: AaveIcon,
      operation: 'Supply',
      summary: p => <AaveSummary {...p} operation="Supply" />,
      platformName: 'Aave',
    },
    {
      stepType: 'aave-withdrawal',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Aave Withdrawal',
      description: 'Withdrawal an asset from Aave',
      icon: AaveIcon,
      operation: 'Withdrawal',
      comingSoon: true,
      summary: p => <AaveSummary {...p} operation="Withdrawal" />,
      platformName: 'Aave',
    },
    {
      stepType: 'aave-borrow',
      stepTypeId: STEP_TYPE_ID_AAVE_BORROW,
      nodeType: 'stepNode',
      name: 'Aave Borrow',
      description: 'Borrow an asset from Aave',
      icon: AaveIcon,
      operation: 'Borrow',
      summary: p => <AaveSummary {...p} operation="Borrow" />,
      platformName: 'Aave',
    },
    {
      stepType: 'aave-repay',
      stepTypeId: STEP_TYPE_ID_AAVE_REPAY,
      nodeType: 'stepNode',
      name: 'Aave Repay',
      description: 'Repay an asset borrowed from Aave',
      icon: AaveIcon,
      operation: 'Repay',
      summary: p => <AaveSummary {...p} operation="Repay" />,
      platformName: 'Aave',
    },
    {
      stepType: 'aave-flash-loan',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Aave Flash Loan',
      description: 'Perform an Aave flash loan',
      icon: AaveIcon,
      operation: 'Flash Loan',
      comingSoon: true,
      summary: p => <AaveSummary {...p} operation="Flash Loan" />,
      platformName: 'Aave',
    },
    {
      stepType: 'aave-loan-health',
      stepTypeId: -1,
      nodeType: 'triggerNode',
      name: 'Aave Loan Health',
      description: 'A trigger that fires when the health factor of an Aave loan drops below a threshold',
      icon: AaveIcon,
      operation: 'Loan Health',
      comingSoon: true,
      summary: p => <AaveLoanHealth {...p} operation="Loan Health" />,
      platformName: 'Aave',
    },
  ],
}
