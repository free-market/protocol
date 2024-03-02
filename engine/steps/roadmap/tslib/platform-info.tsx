import * as React from 'react'
import type { PlatformInfo} from '@freemarket/step-sdk';
import { StepInfo } from '@freemarket/step-sdk'
import OneInchIcon from './branding-assets/OneInchIcon'
import AssetReferenceView from '@freemarket/step-sdk/build/tslib/helpers/AssetReferenceView'
import TelegramIcon from './branding-assets/TelegramIcon'
import StripeIcon from './branding-assets/StripeIcon'
import ZeroExIcon from './branding-assets/ZeroExIcon'

export const oneInchPlatformInfo: PlatformInfo = {
  name: 'One Inch',
  description: 'Decentralized exchange aggregator',
  icon: OneInchIcon,
  categories: ['Swapping'],
  stepInfos: [
    {
      stepType: 'oneInch',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: '1 Inch',
      description: 'Swap tokens using 1 Inch',
      icon: OneInchIcon,
      summary: p => {
        return (
          <span style={{ ...p.labelStyle }}>
            Swap&nbsp;
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
      comingSoon: true,
    },
  ],
}

export const telegramPlatformInfo: PlatformInfo = {
  name: 'Telegram',
  description: 'Messaging',
  icon: TelegramIcon,
  categories: ['Utilities'],
  stepInfos: [
    {
      stepType: 'telegram-send',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Send Telegram Message',
      description: 'Send a message on Telegram',
      icon: TelegramIcon,
      summary: p => {
        return (
          <span style={{ ...p.labelStyle }}>
            To:&nbsp;&nbsp;
            <span style={{ ...p.infoStyle }}>{p.step.to}</span>
          </span>
        )
      },
      comingSoon: true,
    },
  ],
}

export const stripePlatformInfo: PlatformInfo = {
  name: 'Stripe',
  description: 'Fiat Payment Processor',
  icon: StripeIcon,
  categories: ['Utilities'],
  stepInfos: [
    {
      stepType: 'stripe-crypto-onramp',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: 'Stripe Crypto Onramp',
      description: 'Purchase crypto with fiat',
      icon: StripeIcon,
      summary: p => {
        return (
          <span style={{ ...p.labelStyle }}>
            Crypto Asset:&nbsp;
            <AssetReferenceView assetRef={p.step.asset} />
          </span>
        )
      },
      comingSoon: true,
    },
  ],
}

export const zeroExPlatformInfo: PlatformInfo = {
  name: '0x',
  description: '0x offers the core building blocks to create the most powerful Web3 apps.',
  icon: ZeroExIcon,
  categories: ['Swapping'],
  stepInfos: [
    {
      stepType: 'zeroEx-swap',
      stepTypeId: -1,
      nodeType: 'stepNode',
      name: '0x Swap',
      description: 'A DEX aggregator that enables swapping of ERC20 tokens',
      icon: ZeroExIcon,
      summary: p => {
        return (
          <span style={{ ...p.labelStyle }}>
            Swap&nbsp;
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
      comingSoon: true,
    },
  ],
}
