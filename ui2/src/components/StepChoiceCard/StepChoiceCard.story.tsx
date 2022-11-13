import { ComponentStory, ComponentMeta } from '@storybook/react'
import CoreProvider from '@component/CoreProvider'

import { StepChoiceCard as Component } from './StepChoiceCard'

export default {
  title: 'Example/StepChoiceCard',
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

export const StepChoiceCard: ComponentStory<typeof Component> = () => <Component />
StepChoiceCard.args = {}
