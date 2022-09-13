import { ComponentStory, ComponentMeta } from '@storybook/react'

import { ExampleWorkflow as Component } from './ExampleWorkflow'

export const story = {
  title: 'Example/ExampleWorkflow',
  component: Component,
}

export default story as ComponentMeta<typeof Component>

export const ExampleWorkflow: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
)
ExampleWorkflow.args = {
  stageNumber: 0
}
