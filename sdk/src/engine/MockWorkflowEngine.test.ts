import test from 'ava'
import { curveTriCryptoSwap, serumSwap, wethWrap, WorkflowBuilder, wormholeTokenTransfer } from '../builder/WorkflowBuilder'
import { Workflow } from '../types'
import { MockWorkflowEngine, MockWorkflowEngineMode } from './MockWorkflowEngine'
import { WorkflowEvent, WorkflowEventHandler } from './WorkflowEngine'

function buildWorkflow(): Workflow {
  return new WorkflowBuilder()
    .addSteps(
      wethWrap({ amount: '1000000000000000000' }),
      curveTriCryptoSwap({ from: 'WETH', to: 'USDT', amount: '100%' }),
      wormholeTokenTransfer({ fromChain: 'Ethereum', fromToken: 'USDT', toChain: 'Solana', amount: '100%' }),
      serumSwap({ from: 'USDTet', to: 'USDC', amount: '100%' })
    )
    .build()
}

test('executes a mock workflow in signEveryStep mode', async t => {
  const events = [] as WorkflowEvent[]
  const eventHandler: WorkflowEventHandler = event => {
    events.push(event)
  }
  const workflow = buildWorkflow()
  const engine = new MockWorkflowEngine({ mode: MockWorkflowEngineMode.SignEveryStep, eventHandler })
  await engine.execute(workflow)
  t.snapshot(events)
})
