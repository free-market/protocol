import { ComponentStory, ComponentMeta } from '@storybook/react'
import { AnimatePresence } from 'framer-motion'

import CoreProvider from '../CoreProvider'
import { StepBuilder as Component } from './StepBuilder'

export default {
  title: 'Example/StepBuilder',
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
      default: 'light',
      values: [{ name: 'light', value: '#f4f4f5' }],
    },
  },
} as ComponentMeta<typeof Component>

export const StepBuilder: ComponentStory<typeof Component> = (args) => (
  <div className="h-96 grow basis-0 max-w-sm rounded-xl relative super-shadow overflow-hidden">
    <div className="h-full p-2 rounded-xl bg-stone-900 max-w-sm grow basis-0 space-y-5 overflow-y-auto relative">
      <AnimatePresence mode="wait">
        <Component {...args} />
      </AnimatePresence>
    </div>
  </div>
)
StepBuilder.args = {
  overrideSelectedActionGroup: {
    name: 'aave',
    recentlySelected: true,
  },
}
