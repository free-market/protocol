import test, { ExecutionContext } from 'ava'
import { WorkflowInstance } from '../WorkflowInstance'
import type { Workflow, Arguments } from '../../model'
import { throws, assert, shouldRunE2e, getStandardProvider, getStandardWebSocketProvider } from '../../private/test-utils'
import { crossChainAaveDeposit } from '../../examples/cross-chain-deposit'
import dotenv from 'dotenv'
import os from 'os'

dotenv.config({ path: os.homedir() + '/.env' })

const testWorkflowJson = `
{
  "steps": [
    {
      "stepId": "addAsset",
      "type": "add-asset",
      "asset": { "type": "fungible-token", "symbol": "aUSDC" },
      "amount": 1
    }
  ]
}
`

test('instantiates a workflow from a json string', t => {
  new WorkflowInstance(testWorkflowJson)
  t.pass()
})

test('throws an error when there are duplicate stepIds', t => {
  const workflow: Workflow = {
    steps: [
      {
        type: 'add-asset',
        stepId: 'foo',
        nextStepId: 'foo',
        asset: {
          type: 'native',
        },
        amount: 1,
      },
      {
        type: 'add-asset',
        stepId: 'foo',
        asset: {
          type: 'native',
        },
        amount: 1,
      },
    ],
  }
  t.throws(() => new WorkflowInstance(workflow), { message: message => validateExceptionMessage(t, message, 1, /is not unique/) })
})
test('throws an error when there nextStepId refers to a non-existent step', t => {
  const workflow: Workflow = {
    steps: [
      {
        type: 'add-asset',
        nextStepId: 'foo',
        asset: {
          type: 'native',
        },
        amount: 1,
      },
    ],
  }
  t.throws(() => new WorkflowInstance(workflow), { message: message => validateExceptionMessage(t, message, 1, /does not exist/) })
})

test('finds all parameter references in a workflow', t => {
  const workflow: Workflow = {
    parameters: [
      {
        name: 'aaveAsset',
        type: 'asset-ref',
      },
      {
        name: 'aaveAmount',
        type: 'amount',
      },
    ],
    steps: [
      {
        type: 'aave-supply',
        asset: '{{ aaveAsset }}',
        amount: '{{ aaveAmount }}',
      },
    ],
  }
  const runner = new WorkflowInstance(workflow)
  const map = runner['findAllParameterReferences']()
  t.snapshot(map)
})

test('fails to validate when a parameter reference is not found in the declared parameters', t => {
  const workflow: Workflow = {
    parameters: [
      {
        name: 'aave-supply', // <-- declared parameter
        type: 'asset-amount',
        description: 'The asset and amount to deposit into aave',
      },
    ],
    steps: [
      {
        type: 'aave-supply',
        asset: '{{ aaveAsset }}', // <-- parameter reference
        amount: '{{ aaveAmount }}',
      },
    ],
  }
  try {
    new WorkflowInstance(workflow)
    t.fail('it was supposed to throw')
  } catch (e) {
    t.snapshot(e)
  }
})

function validateExceptionMessage(t: ExecutionContext<unknown>, message: string, expectedNumLines: number, expectedRegex: RegExp) {
  const lines = message.split('\n')
  const errorString = `expected ${expectedNumLines} of text but got:\n\n${message}`
  t.is(lines.length, expectedNumLines, errorString)
  // at least one must match
  for (const line of lines) {
    if (expectedRegex.test(line)) {
      return true
    }
  }
  t.fail(`none of the error lines in:\n\n ${message}\n\nmatch ${expectedRegex}`)
  return false
}

test('fails to validate when a parameter reference should be a different type than was declared in workflow.parameters', t => {
  const workflow: Workflow = {
    parameters: [
      {
        name: 'aaveAsset',
        type: 'address', // <-- declared parameter is mistakenly 'address'
        description: 'The asset and amount to deposit into aave',
      },
    ],
    steps: [
      {
        type: 'aave-supply',
        asset: '{{ aaveAsset }}', // <-- parameter reference, should be type 'asset-amount' here
        amount: '{{ aaveAmount }}',
      },
    ],
  }
  try {
    new WorkflowInstance(workflow)
    t.fail('it was supposed to throw')
  } catch (e) {
    t.snapshot(e)
  }
})

test('validate when everything is good', t => {
  const workflow: Workflow = {
    parameters: [
      {
        name: 'aaveAsset',
        type: 'asset-ref',
        description: 'The asset to deposit into aave',
      },
      {
        name: 'aaveAmount',
        type: 'amount',
        description: 'The amount to deposit into aave',
      },
      {
        name: 'startAsset',
        type: 'asset-ref',
        description: 'The asset to add to the workflow',
      },
      {
        name: 'startAmount',
        type: 'amount',
        description: 'The amount to add to the workflow',
      },
    ],
    steps: [
      {
        type: 'add-asset',
        asset: '{{ startAsset }}',
        amount: '{{ startAmount }}',
      },
      {
        type: 'aave-supply',
        asset: '{{ aaveAsset }}', // <-- parameter reference
        amount: '{{ aaveAmount }}',
      },
    ],
  }
  const runner = new WorkflowInstance(workflow)
  t.notThrows(() => runner['validateParameters']())
})

test('fails to validate when there are undeclared arguments', t => {
  const workflow: Workflow = {
    steps: [
      {
        type: 'add-asset',
        asset: {
          type: 'native',
        },
        amount: 1,
      },
    ],
  }
  const args: Arguments = {
    foo: 1,
  }
  throws(t, () => new WorkflowInstance(workflow).validateArguments(args))
})

test('fails to validate when there are zod problems in the workflow', t => {
  const workflow: Workflow = {
    steps: [
      {
        type: 'add-asset',
        asset: {
          type: 'native',
        },
        amount: 'xyz', // <-- schema violation
      },
    ],
  }
  throws(t, () => new WorkflowInstance(workflow))
})

const workflowWithOneParam: Workflow = {
  parameters: [
    {
      name: 'addAssetAmount',
      type: 'amount',
    },
  ],
  steps: [
    {
      type: 'add-asset',
      asset: {
        type: 'native',
      },
      amount: '{{ addAssetAmount }}', // <-- schema violation
    },
  ],
}

test('fails to validate when there are zod problems in the arguments', t => {
  const args: Arguments = {
    addAssetAmount: 'xyz',
  }
  const runner = new WorkflowInstance(workflowWithOneParam)

  throws(t, () => runner.validateArguments(args))
})
test('fails to validate when arguments are not provided for all parameters', t => {
  const runner = new WorkflowInstance(workflowWithOneParam)
  throws(t, () => runner.validateArguments({}))
})

const workflowWithTwoParams: Workflow = {
  parameters: [
    {
      name: 'startAsset',
      type: 'asset-ref',
      description: 'The asset to add to the workflow',
    },
    {
      name: 'startAmount',
      type: 'amount',
      description: 'The amount to add to the workflow',
    },
  ],
  steps: [
    {
      type: 'add-asset',
      asset: '{{ startAsset }}',
      amount: '{{ startAmount }}',
    },
  ],
}

const argsForTwoParamWorkflow: Arguments = {
  startAsset: {
    type: 'fungible-token',
    symbol: 'USDC',
  },
  startAmount: 1000000,
}

test('validates arguments', t => {
  const runner = new WorkflowInstance(workflowWithTwoParams)
  runner.validateArguments(argsForTwoParamWorkflow)
  t.pass()
})

test('applies arguments', async t => {
  const originalWorkflow = new WorkflowInstance(workflowWithTwoParams)
  const workflowBefore = originalWorkflow.getWorkflow()
  const workflowInstanceWithArgs = originalWorkflow['applyArguments'](true, argsForTwoParamWorkflow)
  const workflowWithArgs = workflowInstanceWithArgs.getWorkflow()
  const theStep = workflowWithArgs.steps[0]
  // assert that the workflow structure got patched with the argument values
  assert(t, theStep.type === 'add-asset')
  assert(t, typeof theStep.asset === 'object')
  assert(t, theStep.asset.type === 'fungible-token')
  assert(t, theStep.asset.symbol === 'USDC')
  assert(t, theStep.amount === 1000000)
  // assert  that the original workflow structure did not get modified
  t.deepEqual(workflowBefore, originalWorkflow.getWorkflow())
  t.pass()
})

test('creates a WorkflowRunner', async t => {
  if (!shouldRunE2e()) {
    t.pass('skipping')
    return
  }
  const instance = new WorkflowInstance(crossChainAaveDeposit)
  instance.setProvider('start-chain', getStandardProvider('ETHEREUM_GOERLI_URL'))
  instance.setProvider('arbitrum', getStandardWebSocketProvider('ARBITRUM_GOERLI_WS_URL'))
  const userAddr = '0x242b2eeCE36061FF84EC0Ea69d4902373858fB2F'
  const args: Arguments = {
    targetChainUserAddress: userAddr,
    inputAmount: '1000000',
  }
  await instance.getRunner(userAddr, args)
  t.pass()
})
