import { ComponentStory, ComponentMeta } from '@storybook/react'

import { Button as Component } from './Button'

export const story: unknown = {
  title: 'Example/Button',
  component: Component,
}

export default story as ComponentMeta<typeof Component>

export const Button: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
)
Button.args = {
  primary: true,
  children: 'Button',
}
