import test from 'ava'
import type { Step, Workflow } from '../../model'
import { WorkflowInstance } from '../../runner/WorkflowInstance'
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
  const instance = new WorkflowInstance(flow)
  const helper = new AaveSupplyHelper(instance)
  const encoded = await helper.encodeWorkflowStep({
    chain: 'ethereum',
    stepConfig: step,
    userAddress: '0x1234567890123456789012345678901234567890',
  })
  t.snapshot(encoded)
})
