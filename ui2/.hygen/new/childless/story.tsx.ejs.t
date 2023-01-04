---
to: src/components/<%= component_name %>/<%= component_name %>.story.tsx
---
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { <%= component_name %> as Component } from './<%= component_name %>'

export default {
  title: 'Example/<%= component_name %>',
  component: Component,
} as ComponentMeta<typeof Component>

export const <%= component_name %>: ComponentStory<typeof Component> = () => (
  <Component />
)
<%= component_name %>.args = {}
