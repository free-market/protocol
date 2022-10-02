import { MotionConfig, LazyMotion, domMax } from 'framer-motion'
import { Mainnet, DAppProvider, useEthers, Config, Goerli } from '@usedapp/core'
import { SiweProvider, useSiwe } from '@usedapp/siwe'
import { getDefaultProvider } from 'ethers'

import ExampleWorkflow from './components/ExampleWorkflow'
import ScriptEditor from '@component/ScriptEditor'
import { buildWorkflow } from 'utils'
import { WorkflowView } from '@component/VisualizerLayout/WorkflowView'

const config: Config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    // [Mainnet.chainId]: getDefaultProvider('mainnet'),
    // [Goerli.chainId]: getDefaultProvider('goerli'),
  },
}

const snippet = `module.exports = [
  wethWrap({ amount: '1000000000000000000' }),
  curveTriCryptoSwap({ from: 'WETH', to: 'USDT', amount: '100%' }),
  wormholeTokenTransfer({
    fromChain: 'Ethereum',
    fromToken: 'USDT',
    toChain: 'Solana',
    amount: '100%'
  }),
  saberSwap({ from: 'USDTet', to: 'USDT', amount: '100%' })
]`
const workflow = buildWorkflow()

function App(): JSX.Element {
  return (
    <DAppProvider config={config}>
      <SiweProvider>
        <div className='dark' style={{backgroundColor: '#101010'}}>
          <ScriptEditor snippet={snippet} />,
          <WorkflowView workflow={workflow} />,
        </div>
      </SiweProvider>
    </DAppProvider>
  )
}

export default App
