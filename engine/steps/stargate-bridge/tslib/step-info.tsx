import * as React from 'react'
import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import StargateIcon from './StargateIcon'

import AssetReferenceView from '@freemarket/step-sdk/build/tslib/helpers/AssetReferenceView'
import { SummaryPropsBase } from '@freemarket/step-sdk'
import { StargateBridge } from './model'
import { capitalize } from '@freemarket/core'

type Props = SummaryPropsBase<StargateBridge>

export default function StargateSummary({ step, labelColor, valueColor }: Props) {
  return (
    <div style={{ display: 'flex' }}>
      <span style={{ color: labelColor }}>Bridge&nbsp;</span>
      <span style={{ color: valueColor }}>
        <AssetReferenceView assetRef={step.inputAsset} />
      </span>
      <span style={{ color: labelColor }}>&nbsp;to:&nbsp;</span>
      <span style={{ color: valueColor }}>{capitalize(step.destinationChain)}</span>
    </div>
  )
}

export const platformInfo: PlatformInfo = {
  name: 'Stargate Bridge',
  description: 'Moves an asset between chains',
  icon: StargateIcon,
  categories: ['Bridging'],
  stepInfos: [
    {
      stepType: 'stargate-bridge',
      nodeType: 'stepNode',
      name: 'Stargate Bridge',
      description: 'Moves an asset between chains',
      icon: StargateIcon,
      platformName: 'Stargate',
      summary: StargateSummary,
    },
  ],
}
