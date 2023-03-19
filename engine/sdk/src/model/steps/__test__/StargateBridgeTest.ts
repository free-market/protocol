import test from 'ava'
import { Step, stepSchema } from '../../Step'

test('validates a stargate step', t => {
  const step: Step = {
    type: 'stargate-bridge',
    maxSlippagePercent: 0.01,
    destinationChain: 'arbitrum',
    destinationGasUnits: 1000000,
    destinationUserAddress: '0x1234567890123456789012345678901234567890',
    inputAsset: {
      asset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      amount: 100,
    },
  }
  stepSchema.parse(step)

  const badStep: any = { ...step }
  delete badStep.destinationChain
  t.throws(() => stepSchema.parse(badStep))
})
