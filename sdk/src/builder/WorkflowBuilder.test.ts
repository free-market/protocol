import test from 'ava'
import { Asset } from '../types'
import { stringifyBigNumber } from '../utils'
import { wethWrap, WorkflowBuilder } from './WorkflowBuilder'

test('instantiate a workflow with WorkflowBuilder', t => {
  const builder = new WorkflowBuilder(new Asset('Ethereum', 'ETH'))
  const workflow = builder
    .addSteps(
      wethWrap({ amount: 1000 })
      // curveTriCryptoSwap({ chain: 'Ethereum', from: 'WETH', to: 'USDT', amount: '100%' }),
      // curveThreePoolSwap({ chain: 'Ethereum', from: 'USDT', to: 'USDC', amount: '100%' }),
      // wormholeTokenTransfer({ fromChain: 'Ethereum', fromToken: 'USDC', toChain: 'Solana', amount: '100%' }),
      // serumSwap({ from: 'USDCet', to: 'USDC', amount: '100%' }),
      // mangoDeposit({ symbol: 'USDC', amount: '100%' })
    )
    .build()

  t.log('workflow\n' + JSON.stringify(workflow, stringifyBigNumber, 4))
  t.snapshot(workflow)
})
