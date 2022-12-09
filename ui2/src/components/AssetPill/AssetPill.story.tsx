import { ComponentStory, ComponentMeta } from '@storybook/react'
import { catalog } from 'config'

import { AssetPill as Component } from './AssetPill'

export default {
  title: 'Example/AssetPill',
  component: Component,
} as ComponentMeta<typeof Component>

export const USDCPill: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
)

USDCPill.args = {
  asset: catalog.curve.actions[0].input.asset,
}

export const USDTPill: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
)

USDTPill.args = {
  asset: catalog.curve.actions[0].output.asset,
}
