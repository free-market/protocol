import { ComponentStory, ComponentMeta } from '@storybook/react'
import CoreProvider from '@component/CoreProvider'

import { StepCatalog as Component } from './StepCatalog'

export default {
  title: 'Example/StepCatalog',
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

export const StepCatalog: ComponentStory<typeof Component> = () => <Component />
StepCatalog.args = {}
