import { WorkflowBuilder } from './WorkflowBuilder'

export function buildWorkflow(builder: WorkflowBuilder): void {
  builder.addSteps(
    builder.curve.triCrypto.swap('WBTC', 'USDT', 10),
    builder.curve.threePool.swap('USDT', 'USDC', '100%')
    // builder.curve.threeCurve.swap('USDT', 'USDC', '100%'),
    // builder.wormhole('ETHEREUM','USDT', ETH_PUBLIC_KEY, '100%', 'SOLANA', SOL_PUBLIC_KEY),
    // builder.serum.swap('whUSDC', 'USDC', '100%'),
    // builder.mango.deposit('USDC', '100%'),
    // builder.mango.withdrawal('SOL', '100%'),
    // builder.doWhile(
    //     [
    //         builder.marinade.loan('SOL', '100%'),
    //         builder.marinade.loan('mSOL', '100%'),
    //         builder.marinade.borrow('SOL', '100%')
    //     ],
    //     stepResult => stepResult.outputAmount < 1_000
    // )
  )
}
