import { ComponentStory, ComponentMeta } from '@storybook/react'

import { AssetPill as Component } from './AssetPill'

export default {
  title: 'Example/AssetPill',
  component: Component,
} as ComponentMeta<typeof Component>

export const USDCPill: ComponentStory<typeof Component> = (args) => <Component {...args} />

USDCPill.args = {
  asset: {
    label: 'USDC',
    icon: {
      url: 'https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg',
    },
  },
}

export const USDTPill: ComponentStory<typeof Component> = (args) => <Component {...args} />

USDTPill.args = {
  asset: {
    label: 'USDT',
    icon: {
      url: 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
    },
  },
}
