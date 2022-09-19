import test from 'ava'
import { stringifyBigInt } from '../utils'
import { StepFactories, WorkflowBuilder } from './WorkflowBuilder'

const { weth, curve, wormhole, saber, mango } = StepFactories

test('instantiate a workflow with WorkflowBuilder', t => {
  const builder = new WorkflowBuilder()
  const workflow = builder
    .addSteps(
      weth.wrap({ amount: 1000 }),
      curve.triCrypto.swap({ from: 'WETH', to: 'USDT', amount: '100%' }),
      curve.threePool.swap({ from: 'USDT', to: 'USDC', amount: '100%' }),
      wormhole.transfer({ fromChain: 'Ethereum', fromToken: 'USDC', toChain: 'Solana', amount: '100%' }),
      saber.swap({ from: 'USDCet', to: 'USDC', amount: '100%' }),
      mango.deposit({ symbol: 'USDC', amount: '100%' })
    )
    .build()

  t.log('workflow\n' + JSON.stringify(workflow, stringifyBigInt, 4))
  t.snapshot(workflow)
})
