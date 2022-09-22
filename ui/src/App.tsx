import { MotionConfig, LazyMotion, domMax } from 'framer-motion'
import { Mainnet, DAppProvider, useEthers, Config, Goerli } from '@usedapp/core'
import { SiweProvider, useSiwe } from '@usedapp/siwe'
import { getDefaultProvider } from 'ethers'

import ExampleWorkflow from './components/ExampleWorkflow'

const config: Config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    // [Mainnet.chainId]: getDefaultProvider('mainnet'),
    // [Goerli.chainId]: getDefaultProvider('goerli'),
  },
}

function App(): JSX.Element {
  return (
    <DAppProvider config={config}>
      <SiweProvider>
        <LazyMotion features={domMax} strict>
          <MotionConfig transition={{ duration: 0.2 }}>
            <ExampleWorkflow
              children={null}
              initialStageNumber={0}
              showButtons
              showStageName
            />
          </MotionConfig>
        </LazyMotion>
      </SiweProvider>
    </DAppProvider>
  )
}

export default App
