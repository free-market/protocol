import 'source-map-support/register'
import test from 'ava'
import { oneInchSwap, zkSyncBridge, oceanDexSwap, aaveStake, aaveBorrow } from '../actions'
import { curveThreePoolSwap, curveTriCryptoSwap, wethWrap, WorkflowBuilder, wormholeTokenTransfer } from '../builder/WorkflowBuilder'
import { Workflow } from '../types'
import { mockStepsNoRandom, MockWorkflowEngine, MockWorkflowEngineMode } from './MockWorkflowEngine'
import { WorkflowEvent, WorkflowEventHandler } from './WorkflowEngine'
import { formatMoney } from '../formatMoney'
import { getAssetInfo } from '../assetInfo'

// function buildWorkflow(): Workflow {
//   return new WorkflowBuilder()
//     .addSteps(
//       wethWrap({ amount: '1000000000000000000' }),
//       curveTriCryptoSwap({ chain: 'Ethereum', from: 'WETH', to: 'USDT', amount: '100%' }),
//       wormholeTokenTransfer({ fromAsset: 'Ethereum.USDT', toChain: 'Solana', amount: '100%' })
//     )
//     .build()
// }

// test.skip('executes a mock workflow in signEveryStep mode', async t => {
//   const events = [] as WorkflowEvent[]
//   const eventHandler: WorkflowEventHandler = event => {
//     events.push(event)
//   }
//   const workflow = buildWorkflow()
//   const engine = new MockWorkflowEngine({ mode: MockWorkflowEngineMode.SignEveryStep, eventHandler })
//   await engine.execute(workflow)
//   t.snapshot(events)
// })

mockStepsNoRandom()

test.only('zkSync', async t => {
  const events = [] as WorkflowEvent[]
  const eventHandler: WorkflowEventHandler = event => {
    events.push(event)
  }
  const workflow = new WorkflowBuilder()
    .addSteps(
      oneInchSwap({ chain: 'ZkSync', from: 'WBTC', to: 'USDC', amount: '240000000' }),
      zkSyncBridge({ fromChain: 'ZkSync', token: 'USDC' }),
      aaveStake({ chain: 'Ethereum', token: 'USDC' }),
      aaveBorrow({ chain: 'Ethereum', token: 'WETH' }),
      zkSyncBridge({ fromChain: 'Ethereum', token: 'WETH' })
    )
    .build()

  const engine = new MockWorkflowEngine({ mode: MockWorkflowEngineMode.SignEveryStep, eventHandler })
  await engine.execute(workflow)
  t.snapshot(events)
})

test('sui', async t => {
  const events = [] as WorkflowEvent[]
  const eventHandler: WorkflowEventHandler = event => {
    events.push(event)
  }
  const workflow = new WorkflowBuilder()
    .addSteps(
      oceanDexSwap({ from: 'USDC', to: 'USDCet', amount: 1_000_000_000000 }), // swap USDC for wormhole wrapped USDC
      wormholeTokenTransfer({ fromChain: 'Sui', fromToken: 'USDCet', toChain: 'Ethereum' }), // sending it through unwraps it
      curveThreePoolSwap({ chain: 'Ethereum', from: 'USDC', to: 'USDT' }),
      wormholeTokenTransfer({ fromChain: 'Ethereum', fromToken: 'USDT', toChain: 'Sui' }), // sending it through wraps it
      oceanDexSwap({ from: 'USDTet', to: 'USDT' }) // swap wapped for native
    )
    .build()

  const engine = new MockWorkflowEngine({ mode: MockWorkflowEngineMode.SignEveryStep, eventHandler })
  await engine.execute(workflow)
  t.snapshot(events)
})
