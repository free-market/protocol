import { ComponentStory, ComponentMeta } from '@storybook/react'

import { FeePreview as Component } from './FeePreview'

export default {
  title: 'Example/FeePreview',
  component: Component,
} as ComponentMeta<typeof Component>

export const FeePreview: ComponentStory<typeof Component> = () => <Component />
FeePreview.args = {}
