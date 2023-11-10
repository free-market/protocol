import * as React from 'react'
import { SummaryPropsBase } from '@freemarket/step-sdk'
import { PreviousOutputBranch } from './model'
import { toOperatorStr } from './AssetBalanceBranchSummary'
import AssetReferenceView from '@freemarket/step-sdk/build/tslib/helpers/AssetReferenceView'

type Props = SummaryPropsBase<PreviousOutputBranch>

export default function PreviousOutputBranchSummary({ labelColor, valueColor, step }: Props): JSX.Element {
  return (
    <>
      <span style={{ color: labelColor }}>Previous output &nbsp;</span>
      <span style={{ color: valueColor }}>
        <AssetReferenceView assetRef={step.asset} />
      </span>
      <span style={{ color: valueColor }}>&nbsp;{toOperatorStr(step.comparison)}&nbsp;</span>
      <span style={{ color: valueColor }}>{step.amount.toString()}</span>
    </>
  )
}
