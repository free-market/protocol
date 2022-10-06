/* eslint-disable @typescript-eslint/no-unused-vars */
import treeify from 'treeify'
import {
  curveThreePoolSwap,
  curveTriCryptoSwap,
  mangoDeposit,
  mangoWithdrawal,
  marinadeStake,
  serumSwap,
  wethWrap,
  WorkflowBuilder,
  wormholeTokenTransfer,
} from './builder/WorkflowBuilder'
import { AssetBalances } from './engine/AssetBalances'
import { MockWorkflowEngine, MockWorkflowEngineMode } from './engine/MockWorkflowEngine'
import { WorkflowEvent } from './engine/WorkflowEngine'
import { formatMoney } from './formatMoney'
import { AssetBalance, Workflow } from './types'
import { toHtml } from './utils'

const ONE_ETH = '1000000000000000000'

function buildWorkflow(): Workflow {
  const workflow = new WorkflowBuilder()
    .addSteps(
      wethWrap({ amount: ONE_ETH }),
      curveTriCryptoSwap({ from: 'WETH', to: 'USDT' }),
      curveThreePoolSwap({ from: 'USDT', to: 'USDC' }),
      wormholeTokenTransfer({ fromChain: 'Ethereum', fromToken: 'USDC', toChain: 'Solana' }),
      serumSwap({ from: 'USDCet', to: 'USDC' }),
      mangoDeposit({ symbol: 'USDC' }),
      mangoWithdrawal({ symbol: 'SOL' }),
      marinadeStake()
    )
    .build()
  return workflow
}

// function formatMoney(amount: string, decimals: number) {
//   const left = amount.slice(0, amount.length - decimals)
//   let right = amount.slice(decimals + 1, amount.length)
//   const m = right.match(/([1-9]*).*/)
//   if (m) {
//     right = m[1]
//   }
//   if (right === '') {
//     return left
//   }
//   return left + '.' + right
// }

// callback invoked by the engine whenever there is a progress event
function myWorkflowEventHandler(event: WorkflowEvent) {
  // console.log(treeify.asTree(event as any, true, true))
  if (event.type === 'Completed') {
    console.log(
      `event: ${event.type} ${event.steps[0].info.name} |${event.statusMessage}| gasCost=${event.result!.gasCost},  ${
        event.steps[0].outputAsset.symbol
      } ${formatMoney(event.result!.outputAmount, event.steps[0].outputAsset.info.decimals, 4)}`
    )
    printBalances(event.balances)
  } else if (event.type === 'Starting') {
    console.log(`event: ${event.type} ${event.steps[0].info.name}`)
  } else {
    // console.log(`event: ${event.type} ${event.statusMessage}`)
  }
}

async function demo() {
  const workflow = buildWorkflow()
  // console.log(toHtml(workflow, 'Workflow', 0))
  // console.log(treeify.asTree(workflow as any, true, true))
  // process.exit(0)
  const engine = new MockWorkflowEngine({
    mode: MockWorkflowEngineMode.SignEveryStep,
    minStepDelay: 5,
    maxStepDelay: 8,
    eventHandler: myWorkflowEventHandler,
  })
  await engine.execute(workflow)
}

function printBalances(balances: AssetBalance[]) {
  console.table(
    balances.map(it => ({
      asset: `${it.asset.symbol} (${it.asset.blockChain})`,
      balance: formatMoney(it.balance, it.asset.info.decimals, 4),
    }))
  )
}

demo()
