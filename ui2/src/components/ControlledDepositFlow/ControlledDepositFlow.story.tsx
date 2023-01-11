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
  autoConnect: true,
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
        <Story />
      </WagmiConfig>
    ),
  ],

  parameters: {
    backgrounds: {
      default: 'light',
      values: [{ name: 'light', value: '#f4f4f5' }],
    },
  },

  argTypes: {
    initiallyOpen: { control: 'boolean', defaultValue: true },
  },
} as ComponentMeta<typeof Component>

export const ControlledDepositFlow: ComponentStory<typeof Component> = (
  props,
) => (
  <DepositFlowStateProvider
    initiallyOpen={(props as { initiallyOpen: boolean }).initiallyOpen}
  >
    <Component {...props} />
  </DepositFlowStateProvider>
)
ControlledDepositFlow.args = {}
