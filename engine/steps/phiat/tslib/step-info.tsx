import * as React from 'react'
import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import PhiatIcon from './PhiatIcon'
import AssetReferenceView from '@freemarket/step-sdk/build/tslib/helpers/AssetReferenceView'
import { STEP_TYPE_ID_PHIAT_SUPPLY } from './helper'

function PhiatSummary(props: any) {
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

export const platformInfo: PlatformInfo = {
  name: 'Phiat',
  description: 'Cross chain lending protocol',
  icon: PhiatIcon,
  categories: ['Lending', 'Yield'],

  stepInfos: [
    {
      stepType: 'phiat-supply',
      stepTypeId: STEP_TYPE_ID_PHIAT_SUPPLY,
      nodeType: 'stepNode',
      name: 'Phiat Supply',
      description: 'Deposit an asset into Phiat',
      icon: PhiatIcon,
      operation: 'Supply',
      summary: p => <PhiatSummary {...p} operation="Supply" />,
      platformName: 'Phiat',
    },
    {
      stepType: 'phiat-withdrawal',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Phiat Withdrawal',
      description: 'Withdrawal an asset from Phiat',
      icon: PhiatIcon,
      operation: 'Withdrawal',
      comingSoon: true,
      summary: p => <PhiatSummary {...p} operation="Withdrawal" />,
      platformName: 'Phiat',
    },
    {
      stepType: 'phiat-borrow',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Phiat Borrow',
      description: 'Borrow an asset from Phiat',
      icon: PhiatIcon,
      operation: 'Borrow',
      comingSoon: true,
      summary: p => <PhiatSummary {...p} operation="Borrow" />,
      platformName: 'Phiat',
    },
    {
      stepType: 'phiat-repay',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Phiat Repay',
      description: 'Repay an asset borrowed from Phiat',
      icon: PhiatIcon,
      operation: 'Repay',
      comingSoon: true,
      summary: p => <PhiatSummary {...p} operation="Repay" />,
      platformName: 'Phiat',
    },
    {
      stepType: 'phiat-flash-loan',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Phiat Flash Loan',
      description: 'Perform an Phiat flash loan',
      icon: PhiatIcon,
      operation: 'Flash Loan',
      comingSoon: true,
      summary: p => <PhiatSummary {...p} operation="Flash Loan" />,
      platformName: 'Phiat',
    },
  ],
}
