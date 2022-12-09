import { ComponentStory, ComponentMeta } from '@storybook/react'
import CoreProvider from '@component/CoreProvider'

import { StepEditorPreview as Component } from './StepEditorPreview'

export default {
  title: 'Example/StepEditorPreview',
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

export const StepEditorPreview: ComponentStory<typeof Component> = () => (
  <Component />
)
StepEditorPreview.args = {}
