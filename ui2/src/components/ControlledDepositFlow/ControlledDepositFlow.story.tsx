import { ComponentStory, ComponentMeta } from '@storybook/react'
import { publicProvider } from 'wagmi/providers/public'
import { configureChains, createClient, WagmiConfig, mainnet } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

import { ControlledDepositFlow as Component } from './ControlledDepositFlow'

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet],
  [publicProvider()],
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
        <Story />
      </WagmiConfig>
    ),
  ],
} as ComponentMeta<typeof Component>

export const ControlledDepositFlow: ComponentStory<typeof Component> = (
  props,
) => <Component {...props} />
ControlledDepositFlow.args = {}
