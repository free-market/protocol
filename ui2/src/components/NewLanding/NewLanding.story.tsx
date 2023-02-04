import { ComponentStory, ComponentMeta } from '@storybook/react'

import { NewLanding as Component } from './NewLanding'

export default {
  title: 'Example/NewLanding',
  component: Component,
  parameters: {
    layout: 'fullscreen',
  },
} as ComponentMeta<typeof Component>

export const NewLanding: ComponentStory<typeof Component> = () => <Component />
NewLanding.args = {}
