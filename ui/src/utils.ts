import {
  curveTriCryptoSwap,
  MockWorkflowEngine,
  MockWorkflowEngineMode,
  MoneyAmount,
  serumSwap,
  wethWrap,
  Workflow,
  WorkflowBuilder,
  WorkflowEventHandler,
  wormholeTokenTransfer,
} from '@fmp/sdk'

const ONE_ETH = '1000000000000000000'

export function buildWorkflow(): Workflow {
  const workflow = new WorkflowBuilder()
    .addSteps(
      wethWrap({ amount: ONE_ETH }),
      curveTriCryptoSwap({ from: 'WETH', to: 'USDT', amount: '100%' }),
      wormholeTokenTransfer({
        fromChain: 'Ethereum',
        fromToken: 'USDT',
        toChain: 'Solana',
        amount: '100%',
      }),
      serumSwap({ from: 'USDTet', to: 'USDT', amount: '100%' }),
    )
    .build()
  return workflow
}

export async function executeWorkflow(workflow: Workflow, eventHandler: WorkflowEventHandler) {
  const engine = new MockWorkflowEngine({
    mode: MockWorkflowEngineMode.SignEveryStep,
    minStepDelay: 2000,
    maxStepDelay: 4000,
    submitDelay: 1000,
    eventHandler,
  })
  await engine.execute(workflow)
}
