import * as React from 'react'

import { PlatformInfo, StepInfo } from '@freemarket/step-sdk'
import UniswapIcon from './UniswapIcon'
import AssetReferenceView from '@freemarket/step-sdk/build/tslib/helpers/AssetReferenceView'
import { STEP_TYPE_ID_UNISWAP_EXACT_IN } from '../../step-ids'
import { UniswapExactIn } from './model'
import { STEP_TYPE_ID_UNISWAP_EXACT_OUT } from '../../step-ids'

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

export const platformInfo: PlatformInfo = {
  name: 'Uniswap',
  description: "Web3's most popular decentralized exchange",
  icon: UniswapIcon,
  categories: ['Swapping', 'Yield'],
  stepInfos: [
    {
      stepType: 'uniswap-exact-in',
      stepTypeId: STEP_TYPE_ID_UNISWAP_EXACT_IN,
      nodeType: 'stepNode',
      name: 'Uniswap Exact In',
      description: 'Exchange an asset for another asset on Uniswap, specifying the exact amount of the input asset',
      icon: UniswapIcon,
      operation: 'Exact In',
      platformName: 'Uniswap',
      summary: p => {
        return (
          <span style={{ ...p.labelStyle }}>
            Exact-In&nbsp;
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
      stepType: 'uniswap-exact-out',
      stepTypeId: STEP_TYPE_ID_UNISWAP_EXACT_OUT,
      nodeType: 'stepNode',
      name: 'Uniswap Swap Exact Out',
      description: 'Exchange an asset for another asset on Uniswap, specifying the exact amount of the output asset',
      icon: UniswapIcon,
      operation: 'Exact Out',
      platformName: 'Uniswap',
      summary: p => {
        return (
          <span style={{ ...p.labelStyle }}>
            Exact-Out&nbsp;
            <span style={{ ...p.infoStyle }}>
              {p.step.inputAmount?.toString()}
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
    // {
    //   stepType: 'uniswap-deposit',
    //   stepTypeId: -1,
    //   nodeType: 'stepNode',
    //   name: 'Uniswap Deposit',
    //   description: 'Deposit an asset into Uniswap',
    //   icon: UniswapIcon,
    //   operation: 'Deposit',
    //   comingSoon: true,
    //   platformName: 'Uniswap',
    //   summary: p => <UniswapSummary {...p} operation="Deposit" />,
    // },
    // {
    //   stepType: 'uniswap-withdrawal',
    //   stepTypeId: -1,
    //   nodeType: 'stepNode',
    //   name: 'Uniswap Withdrawal',
    //   description: 'Withdrawal an asset from Uniswap',
    //   icon: UniswapIcon,
    //   operation: 'Withdrawal',
    //   comingSoon: true,
    //   platformName: 'Uniswap',
    //   summary: p => <UniswapSummary {...p} operation="Withdrawal" />,
    // },
  ],
}
