import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { goerli, arbitrumGoerli, avalancheFuji, optimism, arbitrum } from '@wagmi/core/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'

const { chains, provider, webSocketProvider } = configureChains(
  [optimism, arbitrum, goerli, arbitrumGoerli, avalancheFuji],
  [
    infuraProvider({ apiKey: 'b3b072b551ea4092b120e69eb5f43993', priority: 0 }),
    publicProvider({ priority: 1 }),
  ],
)

const client = createClient({
  autoConnect: true,
  provider,
  connectors: [new MetaMaskConnector({ chains })],
  webSocketProvider,
})

export const SharedWagmiConfig = (props: {
  children: React.ReactNode
}): JSX.Element => {
  return (
    <>
      <WagmiConfig client={client}>{props.children}</WagmiConfig>
    </>
  )
}
