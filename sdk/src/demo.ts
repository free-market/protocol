import treeify from 'treeify'
import { curveTriCryptoSwap, saberSwap, wethWrap, WorkflowBuilder, wormholeTokenTransfer } from './builder/WorkflowBuilder'
import { MockWorkflowEngine, MockWorkflowEngineMode } from './engine/MockWorkflowEngine'
import { WorkflowEvent } from './engine/WorkflowEngine'
import { Workflow } from './types'
import { toHtml } from './utils'

function buildWorkflow(): Workflow {
  const workflow = new WorkflowBuilder()
    .addSteps(
      wethWrap({ amount: '1000000000000000000' }),
      curveTriCryptoSwap({ from: 'WETH', to: 'USDT', amount: '100%' }),
      wormholeTokenTransfer({ fromChain: 'Ethereum', fromToken: 'USDT', toChain: 'Solana', amount: '100%' }),
      saberSwap({ from: 'USDTet', to: 'USDT', amount: '100%' })
    )
    .build()
  return workflow
}

// callback invoked by the engine whenever there is a progress event
function myWorkflowEventHandler(event: WorkflowEvent) {
  console.log(treeify.asTree(event as any, true, true))
}

async function demo() {
  const workflow = buildWorkflow()
  console.log(toHtml(workflow, 'Workflow', 0))
  const engine = new MockWorkflowEngine({ mode: MockWorkflowEngineMode.SignEveryStep, eventHandler: myWorkflowEventHandler })
  await engine.execute(workflow)
}

demo()
