import DepositFlowStateProvider from '@component/DepositFlowStateProvider'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { mainnet, goerli, avalancheFuji } from '@wagmi/core/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'

import { ControlledDepositFlow as Component } from './ControlledDepositFlow'
import { State } from '@component/DepositFlowStateProvider/types'

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, goerli, avalancheFuji],
  [
    infuraProvider({ apiKey: '1483a287d2f74587b8039f17a94a2416' }),
    publicProvider(),
  ],
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
    step: { control: 'switch', defaultValue: 'closed' },
  },
} as ComponentMeta<typeof Component>

export const ControlledDepositFlow: ComponentStory<typeof Component> = (
  props,
) => (
  <DepositFlowStateProvider
    initialStep={(props as { initialStep?: State['flowStep'] }).initialStep}
  >
    <Component {...props} />
  </DepositFlowStateProvider>
)
ControlledDepositFlow.args = {}
