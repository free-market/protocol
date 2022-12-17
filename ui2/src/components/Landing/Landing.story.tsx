import { ComponentStory, ComponentMeta } from '@storybook/react'

import { Landing as Component } from './Landing'

export default {
  title: 'Example/Landing',
  component: Component,
  parameters: {
    layout: 'fullscreen',
  },
} as ComponentMeta<typeof Component>

export const Landing: ComponentStory<typeof Component> = () => <Component />
Landing.args = {}
