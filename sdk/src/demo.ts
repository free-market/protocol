import treeify from 'treeify'
import { StepFactories, WorkflowBuilder } from './builder/WorkflowBuilder'
import { MockWorkflowEngine, MockWorkflowEngineMode } from './engine/MockWorkflowEngine'
import { WorkflowEvent } from './engine/WorkflowEngine'
import { Workflow } from './types'

const { weth, curve, wormhole, saber, mango } = StepFactories

function buildWorkflow(): Workflow {
  return new WorkflowBuilder()
    .addSteps(
      weth.wrap({ amount: '1000000000000000000' }),
      curve.triCrypto.swap({ from: 'WETH', to: 'USDT', amount: '100%' }),
      wormhole.transfer({ fromChain: 'Ethereum', fromToken: 'USDT', toChain: 'Solana', amount: '100%' }),
      saber.swap({ from: 'USDTet', to: 'USDC', amount: '100%' })
    )
    .build()
}

function workflowEventHandler(event: WorkflowEvent) {
  console.log(treeify.asTree(event as any, true, true))
}

async function demo() {
  const workflow = buildWorkflow()
  const engine = new MockWorkflowEngine({ mode: MockWorkflowEngineMode.SignEveryStep, eventHandler: workflowEventHandler })
  await engine.execute(workflow)
}

demo()
