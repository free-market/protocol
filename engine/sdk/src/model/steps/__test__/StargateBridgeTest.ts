import test from 'ava'
import { Step, stepSchema } from '../../Step'

test('validates a stargate step', t => {
  const step: Step = {
    type: 'stargate-bridge',
    maxSlippagePercent: 0.01,
    destinationChain: 'arbitrum',
    destinationUserAddress: '0x1234',
    inputAsset: {
      asset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      amount: 100,
    },
    // firstStepOnDestinationChain: 'arbitrum-start',
  }
  stepSchema.parse(step)

  const badStep: any = { ...step }
  delete badStep.destinationUserAddress
  t.throws(() => stepSchema.parse(badStep))
})
