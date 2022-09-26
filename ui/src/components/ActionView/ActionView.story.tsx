import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { ActionView as Component } from './ActionView'

export default {
  title: 'Example/ActionView',
  component: Component,
} as ComponentMeta<typeof Component>

export const ActionView: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
)

ActionView.args = {}
