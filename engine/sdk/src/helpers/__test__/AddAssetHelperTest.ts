import test from 'ava'
import type { Step, Workflow } from '../../model'
import { WorkflowRunner } from '../../runner/WorkflowRunner'
import { AddAssetHelper } from '../AddAssetHelper'

test('encodes', async t => {
  const step: Step = {
    type: 'add-asset',
    asset: {
      type: 'fungible-token',
      symbol: 'USDC',
    },
    amount: 1000000,
  }

  const flow: Workflow = {
    steps: [step],
  }
  const runner = new WorkflowRunner(flow)
  runner.setUserAddress('0x1234567890123456789012345678901234567890')
  const helper = new AddAssetHelper(runner)
  const encoded = await helper.encodeWorkflowStep('ethereum', step)
  t.snapshot(encoded)
})
