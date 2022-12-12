import { ComponentStory, ComponentMeta } from '@storybook/react'

import { ErrorDialog as Component } from './ErrorDialog'

export default {
  title: 'Example/ErrorDialog',
  component: Component,
} as ComponentMeta<typeof Component>

export const ErrorDialog: ComponentStory<typeof Component> = (props) => (
  <Component {...props} />
)
ErrorDialog.args = {}
