import test from 'ava'
import type { Step, Workflow } from '../../model'
import { WorkflowInstance } from '../../runner/WorkflowInstance'
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
  const runner = new WorkflowInstance(flow)
  const helper = new AddAssetHelper(runner)
  const encoded = await helper.encodeWorkflowStep({
    chain: 'ethereum',
    stepConfig: step,
    userAddress: '0x1234567890123456789012345678901234567890',
  })
  t.snapshot(encoded)
})
