import test from 'ava'
import type { Step, Workflow } from '../../model'
import { WorkflowRunner } from '../../runner/WorkflowRunner'
import { AaveSupplyHelper } from '../AaveSupplyHelper'

test('encodes', async t => {
  const step: Step = {
    type: 'aave-supply',
    inputAsset: {
      asset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      amount: '100%',
    },
  }

  const flow: Workflow = {
    steps: [step],
  }
  const runner = new WorkflowRunner(flow)
  runner.setUserAddress('0x1234567890123456789012345678901234567890')
  const helper = new AaveSupplyHelper(runner)
  const encoded = await helper.encodeWorkflowStep('ethereum', step)
  t.snapshot(encoded)
})
