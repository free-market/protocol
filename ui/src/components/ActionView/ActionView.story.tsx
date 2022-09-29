import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { wethWrap } from '@fmp/sdk'

import { ActionView as Component } from './ActionView'

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

export const ActionView: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
)

ActionView.args = {
  step: wethWrap({ amount: '1000000000000000000' }),
}
