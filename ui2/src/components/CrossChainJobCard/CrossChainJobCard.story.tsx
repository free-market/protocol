import { ComponentStory, ComponentMeta } from '@storybook/react'

import { CrossChainJobCard as Component } from './CrossChainJobCard'

export default {
  title: 'Example/CrossChainJobCard',
  component: Component,
  decorators: [(Story) => <Story />],
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#18181b' },
        { name: 'light', value: '#fdf6e3' },
      ],
    },
  },
} as ComponentMeta<typeof Component>

export const CrossChainJobCard: ComponentStory<typeof Component> = (props) => (
  <Component {...props} />
)
CrossChainJobCard.args = {}
