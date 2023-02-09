import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { mainnet, goerli, avalancheFuji, arbitrumGoerli } from '@wagmi/core/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, goerli, avalancheFuji, arbitrumGoerli],
  [
    infuraProvider({ apiKey: '786c6d12fb8c44c28388ac749c59b21a', priority: 1 }),
    publicProvider({ priority: 0 }),
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
