import test from 'ava'
import { stringifyBigInt } from './utils'
import { WorkflowBuilder } from './WorkflowBuilder'
import * as ts from 'typescript'

test('instantiate a workflow with WorkflowBuilder', t => {
  const builder = new WorkflowBuilder()
  const workflow = builder
    .addSteps(
      builder.weth.wrap(1000),
      builder.curve.triCrypto.swap('WETH', 'USDT', '100%'),
      builder.curve.threePool.swap('USDT', 'USDC', '100%'),
      builder.wormhole.transfer('ethereum', 'USDC', 'solana', '100%'),
      builder.saber.swap('USDCet', 'USDC', '100%')
    )
    .build()

  // const src = `
  //   import { WorkflowBuilder } from './WorkflowBuilder'

  //   new WorkflowBuilder()
  //     .addSteps(
  //       builder.weth.wrap(1000),
  //       builder.curve.triCrypto.swap('WETH', 'USDT', '100%'),
  //       builder.curve.threePool.swap('USDT', 'USDC', '100%'),
  //       builder.wormhole.transfer('ethereum', 'USDC', 'solana', '100%'),
  //       builder.saber.swap('USDCet', 'USDC', '100%')
  //     )
  //     .build()
  // `
  // // const transpiled = ts.transpile('({ ' + src + ' })')
  // const transpiled = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
  // const workflow2 = eval(transpiled.outputText)
  // console.log(workflow2)

  t.log('workflow\n' + JSON.stringify(workflow, stringifyBigInt, 4))
  t.snapshot(workflow)
})
