import { ComponentStory, ComponentMeta } from '@storybook/react'
import CoreProvider from '@component/CoreProvider'

import { StepChoiceEditor as Component } from './StepChoiceEditor'

export default {
  title: 'Example/StepChoiceEditor',
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

export const StepChoiceEditor: ComponentStory<typeof Component> = () => (
  <Component />
)
StepChoiceEditor.args = {}
