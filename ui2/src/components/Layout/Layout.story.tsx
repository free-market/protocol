import { ComponentStory, ComponentMeta } from '@storybook/react'

import CoreProvider from '../CoreProvider'
import { Layout as Component } from './Layout'

export default {
  title: 'Example/Layout',
  component: Component,
  decorators: [
    (Story, context) => (
      <CoreProvider
        initialCatalog="open"
        initialWorkflowSteps={
          context.globals.preset === '1inch'
            ? [
                {
                  id: '1inch:0',
                  stepChoice: {
                    index: 0,
                  },
                  actionGroup: {
                    name: '1inch',
                  },
                  recentlyAdded: false,
                },
                {
                  id: 'zksync:0',
                  stepChoice: {
                    index: 0,
                  },
                  actionGroup: {
                    name: 'zksync',
                  },
                  recentlyAdded: false,
                },
                {
                  id: 'aave:0',
                  stepChoice: {
                    index: 0,
                  },
                  actionGroup: {
                    name: 'aave',
                  },
                  recentlyAdded: false,
                },
                {
                  id: 'aave:1',
                  stepChoice: {
                    index: 1,
                  },
                  actionGroup: {
                    name: 'aave',
                  },
                  recentlyAdded: false,
                },
                {
                  id: 'zksync:1',
                  stepChoice: {
                    index: 1,
                  },
                  actionGroup: {
                    name: 'zksync',
                  },
                  recentlyAdded: false,
                },
              ]
            : undefined
        }
      >
        <Story />
      </CoreProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#18181b' },
        { name: 'light', value: '#fdf6e3' },
      ],
    },
  },
} as ComponentMeta<typeof Component>

export const Layout: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
)
Layout.args = {}
