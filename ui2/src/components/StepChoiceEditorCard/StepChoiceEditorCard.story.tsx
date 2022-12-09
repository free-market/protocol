import { ComponentStory, ComponentMeta } from '@storybook/react'
import CoreProvider from '@component/CoreProvider'

import { StepChoiceEditorCard as Component } from './StepChoiceEditorCard'

export default {
  title: 'Example/StepChoiceEditorCard',
  component: Component,
  decorators: [
    (Story) => (
      <CoreProvider initialNoSelectedStepChoice={false}>
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

export const StepChoiceEditorCard: ComponentStory<typeof Component> = () => (
  <Component />
)
StepChoiceEditorCard.args = {}
