import { WorkflowProvider } from './components/WorkflowProvider'
import VisualizerLayout from './components/VisualizerLayout'
import ScriptEditor from './components/ScriptEditor'
import ActionView from './components/ActionView'
import { buildWorkflow } from './utils'

const workflow = buildWorkflow()

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

function App(): JSX.Element {
  const editor = <ScriptEditor snippet={snippet} children={null} />

  return (
    <WorkflowProvider>
      <VisualizerLayout editor={editor}>
        {workflow.steps.map((it, index) => (
          <ActionView step={it} stepIndex={index} />
        ))}
      </VisualizerLayout>
    </WorkflowProvider>
  )
}

export default App
