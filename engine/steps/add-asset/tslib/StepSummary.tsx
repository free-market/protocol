import * as React from 'react'
import type { AddAsset } from './model'
import AssetReferenceView from '@freemarket/step-sdk/build/tslib/helpers/AssetReferenceView'
import Amount from './Amount'
import type { SummaryPropsBase } from '@freemarket/step-sdk'

type Props = SummaryPropsBase<AddAsset>

export default function AddAssetStepSummary({ step, labelColor, valueColor }: Props) {
  return (
    <div style={{ display: 'flex' }}>
      <span style={{ color: labelColor }}>Asset:&nbsp;</span>
      <span style={{ color: valueColor }}>
        <AssetReferenceView assetRef={step.asset} />
      </span>
      <span style={{ color: labelColor, paddingLeft: 12 }}>Amount:&nbsp;</span>
      <span style={{ color: valueColor }}>
        <Amount amount={step.amount} />
      </span>
    </div>
  )
}
