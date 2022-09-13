import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Web3ContextProvider } from 'ethers-react'

import { ExampleWorkflow as Component } from './ExampleWorkflow'

export const story = {
  title: 'Example/ExampleWorkflow',
  component: Component,
}

export default story as ComponentMeta<typeof Component>

export const ExampleWorkflow: ComponentStory<typeof Component> = (args) => (
  <Web3ContextProvider>
    <Component {...args} />
  </Web3ContextProvider>
)
ExampleWorkflow.args = {
  stageNumber: 0,
}
