import { ComponentStory, ComponentMeta } from '@storybook/react'
import CoreProvider from '@component/CoreProvider'

import { StepChoiceCard as Component } from './StepChoiceCard'
import { catalog } from 'config'

export default {
  title: 'Example/StepChoiceCard',
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

export const StepChoiceCard: ComponentStory<typeof Component> = () => (
  <Component action={catalog.curve.actions[0]} />
)
StepChoiceCard.args = {}
