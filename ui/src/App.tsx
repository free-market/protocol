// import { Mainnet, Config } from '@usedapp/core'
// import { buildWorkflow } from 'utils'
import WorkflowStepView from '@component/ActionView'
import { WorkflowView } from '@component/VisualizerLayout/WorkflowView'
import { buildWorkflow } from 'utils'
import './magic-box.css'
// import './card.css'

// const snippet = `module.exports = [
//   wethWrap({ amount: '1000000000000000000' }),
//   curveTriCryptoSwap({ from: 'WETH', to: 'USDT', amount: '100%' }),
//   wormholeTokenTransfer({
//     fromChain: 'Ethereum',
//     fromToken: 'USDT',
//     toChain: 'Solana',
//     amount: '100%'
//   }),
//   saberSwap({ from: 'USDTet', to: 'USDT', amount: '100%' })
// ]`
const workflow = buildWorkflow()

function App(): JSX.Element {
  return (
    <div className="dark flex flex-col space-y-5 max-w-4xl mx-auto">
      <div style={{ minHeight: 30 }}></div>
      <div>
        <WorkflowView workflow={workflow} />
      </div>
    </div>
  )
}

export default App
