import DepositFlowStateProvider from '@component/DepositFlowStateProvider'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { configureChains, createClient, WagmiConfig, mainnet } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { infuraProvider } from 'wagmi/providers/infura'

import { ControlledDepositFlow as Component } from './ControlledDepositFlow'

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet],
  [infuraProvider({ apiKey: '1483a287d2f74587b8039f17a94a2416' })],
)

const client = createClient({
  provider,
  connectors: [new MetaMaskConnector({ chains })],
  webSocketProvider,
})

export default {
  title: 'Example/ControlledDepositFlow',
  component: Component,
  decorators: [
    (Story) => (
      <WagmiConfig client={client}>
        <DepositFlowStateProvider>
          <Story />
        </DepositFlowStateProvider>
      </WagmiConfig>
    ),
  ],
} as ComponentMeta<typeof Component>

export const ControlledDepositFlow: ComponentStory<typeof Component> = (
  props,
) => <Component {...props} />
ControlledDepositFlow.args = {}
