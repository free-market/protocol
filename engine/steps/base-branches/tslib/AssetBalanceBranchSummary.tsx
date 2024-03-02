import * as React from 'react'
import type { SummaryPropsBase } from '@freemarket/step-sdk'
import type { AssetBalanceBranch, ComparisonOperator } from './model'
import { capitalize } from '@freemarket/core'
import AssetReferenceView from '@freemarket/step-sdk/build/tslib/helpers/AssetReferenceView'

type Props = SummaryPropsBase<AssetBalanceBranch>

export function toOperatorStr(operator: ComparisonOperator) {
  switch (operator) {
    case 'greater-than':
      return '>'
    case 'greater-than-equal':
      return '>='
    case 'less-than':
      return '<'
    case 'less-than-equal':
      return '<='
    case 'equal':
      return '=='
    case 'not-equal':
      return '!='
  }
}

export default function AssetBalanceBranchSummary({ labelColor, valueColor, step }: Props): JSX.Element {
  return (
    <>
      <span style={{ color: labelColor }}>Balance of &nbsp;</span>
      <span style={{ color: valueColor }}>
        <AssetReferenceView assetRef={step.asset} />
      </span>
      <span style={{ color: valueColor }}>&nbsp;{toOperatorStr(step.comparison)}&nbsp;</span>
      <span style={{ color: valueColor }}>{step.amount.toString()}</span>
    </>
  )
}
