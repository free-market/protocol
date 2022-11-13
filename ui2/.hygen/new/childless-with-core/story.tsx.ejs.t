---
to: src/components/<%= component_name %>/<%= component_name %>.story.tsx
---
import { ComponentStory, ComponentMeta } from '@storybook/react'
import CoreProvider from '@component/CoreProvider'

import { <%= component_name %> as Component } from './<%= component_name %>'

export default {
  title: 'Example/<%= component_name %>',
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

export const <%= component_name %>: ComponentStory<typeof Component> = () => (
  <Component />
)
<%= component_name %>.args = {}
