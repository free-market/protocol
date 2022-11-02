import { wethWrap, WorkflowBuilder } from '@fmp/sdk'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { WorkflowProvider } from '../WorkflowProvider'
import ThemeSelector from '../ThemeSelector'

import { WorkflowStepCard as Component } from './WorkflowStepCard'

export default {
  title: 'Example/WorkflowStepCard',
  component: Component,
  decorators: [
    (Story) => (
      <WorkflowProvider>
        <ThemeSelector />
        <Story />
      </WorkflowProvider>
    ),
  ],
  parameters: {
    backgrounds: {
      default: window && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      values: [
        { name: 'dark', value: '#002b36' },
        { name: 'light', value: '#fdf6e3' },
        { name: 'poppy', value: 'black' },
      ],
    },
  },
} as ComponentMeta<typeof Component>

export const WorkflowStepCard: ComponentStory<typeof Component> = (args) => <Component {...args} />
WorkflowStepCard.args = {
  step: new WorkflowBuilder().toWorkflowAction(wethWrap({ amount: '1000000000000000000' })),
}
