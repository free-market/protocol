import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { wethWrap } from '@fmp/sdk'

import { WorkflowStepView as Component } from './WorkflowStepView'

export default {
  title: 'Example/ActionView',
  component: Component,
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#002b36' },
        { name: 'light', value: '#fdf6e3' },
      ],
    },
  },
} as ComponentMeta<typeof Component>

export const WorkflowStepView: ComponentStory<typeof Component> = (args) => <Component {...args} />

WorkflowStepView.args = {
  step: wethWrap({ amount: '1000000000000000000' }),
}
