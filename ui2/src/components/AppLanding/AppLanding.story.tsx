import { ComponentStory, ComponentMeta } from '@storybook/react'

import { AppLanding as Component } from './AppLanding'

export default {
  title: 'Example/AppLanding',
  component: Component,
  parameters: {
    layout: 'fullscreen',
  },
} as ComponentMeta<typeof Component>

export const AppLanding: ComponentStory<typeof Component> = () => <Component />
AppLanding.args = {}
