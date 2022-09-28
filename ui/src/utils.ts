import {
  curveTriCryptoSwap,
  MoneyAmount,
  serumSwap,
  wethWrap,
  Workflow,
  WorkflowBuilder,
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

export function formatMoney(amount: MoneyAmount, decimals: number) {
  const s = amount.toString()
  if (s.endsWith('%')) {
    return s
  }
  const left = s.slice(0, s.length - decimals)
  let right = s.slice(decimals + 1, s.length)
  const m = right.match(/([1-9]*).*/)
  if (m) {
    right = m[1]
  }
  if (right === '') {
    return left
  }
  return left + '.' + right
}
