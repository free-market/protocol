---
to: src/components/<%= component_name %>/<%= component_name %>.story.tsx
---
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { <%= component_name %> as Component } from './<%= component_name %>'

export const story = {
  title: 'Example/<%= component_name %>',
  component: Component,
}

export default story as ComponentMeta<typeof Component>

export const <%= component_name %>: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
)
<%= component_name %>.args = {}
