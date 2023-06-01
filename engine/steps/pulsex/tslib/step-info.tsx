import * as React from 'react'

import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import PulsexIcon from './PulseXIcon'
import AssetReferenceView from '@freemarket/step-sdk/build/tslib/helpers/AssetReferenceView'
import { STEP_TYPE_ID_PULSEX_EXACT_IN } from './helper'
import { PulsexExactIn } from './model'

function PulsexSummary(props: any) {
  return (
    <span style={{ ...props.labelStyle }}>
      {props.operation}&nbsp;
      <span style={{ ...props.infoStyle }}>
        {props.amount.toString()}
        &nbsp;
        {props.step.inputSymbol}
      </span>
      →<span style={{ ...props.infoStyle }}>{props.step.inputSymbol}</span>
    </span>
  )
}

export const platformInfo: PlatformInfo = {
  name: 'PulseX',
  description: "PulseChain's most popular decentralized exchange",
  icon: PulsexIcon,
  categories: ['Swapping', 'Yield'],
  stepInfos: [
    {
      stepType: 'pulsex-exact-in',
      stepTypeId: STEP_TYPE_ID_PULSEX_EXACT_IN,
      nodeType: 'stepNode',
      name: 'Pulsex Exact In',
      description: 'Exchange an asset for another asset on Pulsex, specifying the exact amount of the input asset',
      icon: PulsexIcon,
      operation: 'Exact In',
      platformName: 'Pulsex',
      summary: p => {
        return (
          <span style={{ ...p.labelStyle }}>
            Swap&nbsp;
            <span style={{ ...p.infoStyle }}>
              {p.step.inputAmount.toString()}
              &nbsp;
              <AssetReferenceView assetRef={p.step.inputAsset} />
            </span>
            &nbsp;→&nbsp;
            <span style={{ ...p.infoStyle }}>
              <AssetReferenceView assetRef={p.step.outputAsset} />
            </span>
          </span>
        )
      },
    },
    {
      stepType: 'pulsex-exact-out',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Pulsex Swap',
      description: 'Exchange an asset for another asset on Pulsex, specifying the exact amount of the output asset',
      icon: PulsexIcon,
      operation: 'Exact Out',
      platformName: 'Pulsex',
      summary: p => <PulsexSummary {...p} operation="Swap" />,
    },
    {
      stepType: 'pulsex-deposit',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Pulsex Deposit',
      description: 'Deposit an asset into Pulsex',
      icon: PulsexIcon,
      operation: 'Deposit',
      comingSoon: true,
      platformName: 'Pulsex',
      summary: p => <PulsexSummary {...p} operation="Deposit" />,
    },
    {
      stepType: 'pulsex-withdrawal',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Pulsex Withdrawal',
      description: 'Withdrawal an asset from Pulsex',
      icon: PulsexIcon,
      operation: 'Withdrawal',
      comingSoon: true,
      platformName: 'Pulsex',
      summary: p => <PulsexSummary {...p} operation="Withdrawal" />,
    },
  ],
}
