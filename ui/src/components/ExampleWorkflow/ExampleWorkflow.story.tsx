import * as React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Mainnet, DAppProvider, useEthers, Config, Goerli } from '@usedapp/core'
import { SiweProvider, useSiwe } from '@usedapp/siwe'
import { getDefaultProvider } from 'ethers'
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

import { ExampleWorkflow as Component } from './ExampleWorkflow'

const wallets = [
  new PhantomWalletAdapter()
]

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
    (Story: Function) => (
    <ConnectionProvider endpoint="https://solana-mainnet.phantom.app/YBPpkkN4g91xDiAnTE9r0RcMkjg0sKUIWvAfoFVJ">
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
  <DAppProvider config={config}>
    <SiweProvider>
      <Story />
    </SiweProvider>
  </DAppProvider>
      </WalletModalProvider>
    </WalletProvider>
    </ConnectionProvider>
    )
  ]
}

export default story as ComponentMeta<typeof Component>

export const ExampleWorkflow: ComponentStory<typeof Component> = (args) => (
      <Component {...args} />
)

ExampleWorkflow.args = {
  initialStageNumber: 0,
}
