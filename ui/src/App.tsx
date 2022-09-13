import { MotionConfig, LazyMotion, domMax } from 'framer-motion'
import { Mainnet, DAppProvider, useEthers, Config, Goerli } from '@usedapp/core'
import { SiweProvider, useSiwe } from '@usedapp/siwe'
import { getDefaultProvider } from 'ethers'
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

import ExampleWorkflow from './components/ExampleWorkflow'

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

function App(): JSX.Element {
  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
    <DAppProvider config={config}>
      <SiweProvider>
        <LazyMotion features={domMax} strict>
          <MotionConfig transition={{ duration: 0.2 }}>
            <ExampleWorkflow children={null} initialStageNumber={0} />
          </MotionConfig>
        </LazyMotion>
      </SiweProvider>
    </DAppProvider>
      </WalletModalProvider>
    </WalletProvider>
  )
}

export default App
