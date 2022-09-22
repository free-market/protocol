import * as React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Mainnet, DAppProvider, useEthers, Config, Goerli } from '@usedapp/core'
import { SiweProvider, useSiwe } from '@usedapp/siwe'
import { getDefaultProvider } from 'ethers'

import { ExampleWorkflow as Component } from './ExampleWorkflow'

const config: Config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: getDefaultProvider('mainnet'),
    [Goerli.chainId]: getDefaultProvider('goerli'),
  },
}

export const story = {
  title: 'Example/ExampleWorkflow',
  component: Component,
  decorators: [
    (Story: React.ComponentType) => (
      <DAppProvider config={config}>
        <SiweProvider>
          <Story />
        </SiweProvider>
      </DAppProvider>
    ),
  ],
}

export default story as ComponentMeta<typeof Component>

export const ExampleWorkflow: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
)

ExampleWorkflow.args = {
  showButtons: true,
  showStageName: true,
  initialStageNumber: 0,
}
