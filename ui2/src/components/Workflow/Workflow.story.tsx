import { ComponentStory, ComponentMeta } from '@storybook/react'
import CoreProvider from '@component/CoreProvider'

import { Workflow as Component } from './Workflow'

export default {
  title: 'Example/Workflow',
  component: Component,
  decorators: [
    (Story) => (
      <CoreProvider>
        <Story />
      </CoreProvider>
    ),
  ],
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

export const Workflow: ComponentStory<typeof Component> = () => <Component />
Workflow.args = {}
