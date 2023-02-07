import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { mainnet, goerli, avalancheFuji } from '@wagmi/core/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'

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

export const SharedWagmiConfig = (props: {
  children: React.ReactNode
}): JSX.Element => {
  return (
    <>
      <WagmiConfig client={client}>{props.children}</WagmiConfig>
    </>
  )
}
