import * as React from 'react'

import { StepInfo } from '@freemarket/step-sdk'
import UniswapIcon from './UniswapIcon'
import AssetReferenceView from '@freemarket/step-sdk/build/tslib/helpers/AssetReferenceView'

function UniswapSummary(props: any) {
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

export const stepInfos: StepInfo[] = [
  {
    stepType: 'uniswap-exact-in',
    nodeType: 'stepNode',
    name: 'Uniswap Swap',
    description: 'Exchange an asset for another asset on Uniswap, specifying the exact amount of the input asset',
    platform: 'Uniswap',
    categories: ['Swapping'],
    icon: UniswapIcon,
    operation: 'Exact In',
    summary: p => {
      return (
        <span style={{ ...p.labelStyle }}>
          Swap&nbsp;
          <span style={{ ...p.infoStyle }}>
            {p.step.inputAmount.toString()}
            &nbsp;
            {p.step.inputSymbol}
          </span>
          &nbsp;→&nbsp;<span style={{ ...p.infoStyle }}>{p.step.outputSymbol}</span>
        </span>
      )
    },
  },
  {
    stepType: 'uniswap-exact-out',
    nodeType: 'stepNode',
    name: 'Uniswap Swap',
    description: 'Exchange an asset for another asset on Uniswap, specifying the exact amount of the output asset',
    platform: 'Uniswap',
    categories: ['Swapping'],
    icon: UniswapIcon,
    operation: 'Exact Out',
    summary: p => <UniswapSummary {...p} operation="Swap" />,
  },
  {
    stepType: 'uniswap-deposit',
    nodeType: 'stepNode',
    name: 'Uniswap Deposit',
    description: 'Deposit an asset into Uniswap',
    platform: 'Uniswap',
    categories: ['Yield'],
    icon: UniswapIcon,
    operation: 'Deposit',
    comingSoon: true,
    summary: p => <UniswapSummary {...p} operation="Deposit" />,
  },
  {
    stepType: 'uniswap-withdrawal',
    nodeType: 'stepNode',
    name: 'Uniswap Withdrawal',
    description: 'Withdrawal an asset from Uniswap',
    platform: 'Uniswap',
    categories: ['Yield'],
    icon: UniswapIcon,
    operation: 'Withdrawal',
    comingSoon: true,
    summary: p => <UniswapSummary {...p} operation="Withdrawal" />,
  },
]
