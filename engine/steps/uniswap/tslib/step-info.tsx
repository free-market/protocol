import * as React from 'react'

import type { PlatformInfo } from '@freemarket/step-sdk'
import UniswapIcon from './UniswapIcon'
import AssetReferenceView from '@freemarket/step-sdk/build/tslib/helpers/AssetReferenceView'
import { STEP_TYPE_ID_UNISWAP_EXACT_IN } from './UniswapExactInHelper'
import { STEP_TYPE_ID_UNISWAP_EXACT_OUT } from './UniswapExactOutHelper'
export const STEP_TYPE_ID_UNISWAP_MINT_POSITION = 113
export const STEP_TYPE_ID_UNISWAP_ADD_LIQUIDITY = 114
export const STEP_TYPE_ID_UNISWAP_POSITION_EXISTS = 115

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
    {
      stepType: 'uniswap-mint-position',
      stepTypeId: STEP_TYPE_ID_UNISWAP_MINT_POSITION,
      nodeType: 'stepNode',
      name: 'Uniswap Mint Position',
      description: 'Create a new liquidity position on Uniswap',
      icon: UniswapIcon,
      operation: 'Mint Position',
      platformName: 'Uniswap',
      comingSoon: true,
      summary: p => {
        return (
          <span style={{ ...p.labelStyle }}>
            <span style={{ ...p.infoStyle }}>
              <AssetReferenceView assetRef={p.step.tokenA} />
            </span>
            &nbsp;/&nbsp;
            <span style={{ ...p.infoStyle }}>
              <AssetReferenceView assetRef={p.step.tokenB} />
            </span>
          </span>
        )
      },
    },
    {
      stepType: 'uniswap-add-liquidity',
      stepTypeId: STEP_TYPE_ID_UNISWAP_ADD_LIQUIDITY,
      nodeType: 'stepNode',
      name: 'Uniswap Add Liquidity',
      description: 'Add to an existing liquidity position',
      icon: UniswapIcon,
      operation: 'Add Liquidity',
      platformName: 'Uniswap',
      comingSoon: true,
      summary: p => {
        return (
          <span style={{ ...p.labelStyle }}>
            <span style={{ ...p.infoStyle }}>
              <AssetReferenceView assetRef={p.step.tokenA} />
            </span>
            &nbsp;/&nbsp;
            <span style={{ ...p.infoStyle }}>
              <AssetReferenceView assetRef={p.step.tokenB} />
            </span>
          </span>
        )
      },
    },
    {
      stepType: 'uniswap-position-exists',
      stepTypeId: STEP_TYPE_ID_UNISWAP_POSITION_EXISTS,
      nodeType: 'branchNode',
      name: 'Position Exists',
      operation: 'Position Exists',
      description: 'Branches based on whether a liquidity position exists on Uniswap for the given arguments',
      icon: UniswapIcon,
      comingSoon: true,
      summary: p => {
        return (
          <span style={{ ...p.labelStyle }}>
            <span style={{ ...p.infoStyle }}>
              <AssetReferenceView assetRef={p.step.tokenA} />
            </span>
            &nbsp;/&nbsp;
            <span style={{ ...p.infoStyle }}>
              <AssetReferenceView assetRef={p.step.tokenB} />
            </span>
          </span>
        )
      },
    },
  ],
}
