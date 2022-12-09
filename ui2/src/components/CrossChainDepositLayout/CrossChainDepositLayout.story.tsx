import { ComponentStory, ComponentMeta } from '@storybook/react'

import { CrossChainDepositLayout as Component } from './CrossChainDepositLayout'

export default {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [{ name: 'light', value: '#f4f4f5' }],
    },
  },
  title: 'Example/CrossChainDepositLayout',
  component: Component,
} as ComponentMeta<typeof Component>

export const CrossChainDepositLayout: ComponentStory<typeof Component> = (props) => <Component {...props} />
CrossChainDepositLayout.args = {}
