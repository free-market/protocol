import test from 'ava'
import { stringifyBigInt } from '../utils'
import {
  curveThreePoolSwap,
  curveTriCryptoSwap,
  mangoDeposit,
  serumSwap,
  wethWrap,
  WorkflowBuilder,
  wormholeTokenTransfer,
} from './WorkflowBuilder'

test('instantiate a workflow with WorkflowBuilder', t => {
  const builder = new WorkflowBuilder()
  const workflow = builder
    .addSteps(
      wethWrap({ amount: 1000 }),
      curveTriCryptoSwap({ from: 'WETH', to: 'USDT', amount: '100%' }),
      curveThreePoolSwap({ from: 'USDT', to: 'USDC', amount: '100%' }),
      wormholeTokenTransfer({ fromChain: 'Ethereum', fromToken: 'USDC', toChain: 'Solana', amount: '100%' }),
      serumSwap({ from: 'USDCet', to: 'USDC', amount: '100%' }),
      mangoDeposit({ symbol: 'USDC', amount: '100%' })
    )
    .build()

  t.log('workflow\n' + JSON.stringify(workflow, stringifyBigInt, 4))
  t.snapshot(workflow)
})
