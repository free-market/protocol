import { ComponentStory, ComponentMeta } from '@storybook/react'

import { CrossChainDepositLayout as Component } from './CrossChainDepositLayout'

export default {
  title: 'Example/CrossChainDepositLayout',
  component: Component,
} as ComponentMeta<typeof Component>

export const CrossChainDepositLayout: ComponentStory<typeof Component> = () => <Component />
CrossChainDepositLayout.args = {}
