import treeify from 'treeify'
import { curveTriCryptoSwap, serumSwap, wethWrap, WorkflowBuilder, wormholeTokenTransfer } from './builder/WorkflowBuilder'
import { MockWorkflowEngine, MockWorkflowEngineMode } from './engine/MockWorkflowEngine'
import { WorkflowEvent } from './engine/WorkflowEngine'
import { Workflow } from './types'
import { toHtml } from './utils'

const ONE_ETH = '1000000000000000000'

function buildWorkflow(): Workflow {
  const workflow = new WorkflowBuilder()
    .addSteps(
      wethWrap({ amount: ONE_ETH }),
      curveTriCryptoSwap({ from: 'WETH', to: 'USDT', amount: '100%' }),
      wormholeTokenTransfer({ fromChain: 'Ethereum', fromToken: 'USDT', toChain: 'Solana', amount: '100%' }),
      serumSwap({ from: 'USDTet', to: 'USDT', amount: '100%' })
    )
    .build()
  return workflow
}

function formatMoney(amount: string, decimals: number) {
  const left = amount.slice(0, amount.length - decimals)
  let right = amount.slice(decimals + 1, amount.length)
  const m = right.match(/([1-9]*).*/)
  if (m) {
    right = m[1]
  }
  if (right === '') {
    return left
  }
  return left + '.' + right
}

// callback invoked by the engine whenever there is a progress event
function myWorkflowEventHandler(event: WorkflowEvent) {
  // console.log(treeify.asTree(event as any, true, true))
  if (event.type === 'Completed') {
    console.log(
      `event: ${event.type} ${event.statusMessage} gasCost=${event.result!.gasCost},  ${event.steps[0].outputAsset.symbol} ${formatMoney(
        event.result!.outputAmount,
        event.steps[0].outputAsset.info.decimals
      )}`
    )
  } else if (event.type === 'Starting') {
    console.log(`event: ${event.type} ${event.steps[0].info.name}`)
  } else {
    console.log(`event: ${event.type} ${event.statusMessage}`)
  }
}

async function demo() {
  const workflow = buildWorkflow()
  // console.log(toHtml(workflow, 'Workflow', 0))
  const engine = new MockWorkflowEngine({
    mode: MockWorkflowEngineMode.SignEveryStep,
    minStepDelay: 5,
    maxStepDelay: 8,
    eventHandler: myWorkflowEventHandler,
  })
  await engine.execute(workflow)
}

demo()
