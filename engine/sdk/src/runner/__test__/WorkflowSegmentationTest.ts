import test from 'ava'
import type { Workflow } from '../../model'
import { WorkflowInstance } from '../WorkflowInstance'
import { addAssetStep, aaveSupplyStep, stargateBridgeStep, chainBranchStep } from './common'

test('processes a single chain single node workflow', t => {
  const workflow1: Workflow = {
    steps: [addAssetStep],
  }
  const runner = new WorkflowInstance(workflow1)
  const segments = runner.getWorkflowSegments()
  t.snapshot(segments)
})

test('processes a single chain multi node workflow', t => {
  const workflow2: Workflow = {
    steps: [addAssetStep, aaveSupplyStep],
  }
  const runner = new WorkflowInstance(workflow2)
  const segments = runner.getWorkflowSegments()
  t.snapshot(segments)
})

test('processes a multi chain workflow', t => {
  const workflow: Workflow = {
    steps: [addAssetStep, stargateBridgeStep, aaveSupplyStep],
  }
  const runner = new WorkflowInstance(workflow)
  const segments = runner.getWorkflowSegments()
  t.snapshot(segments)
})

test('handles branch nodes', t => {
  const workflow: Workflow = {
    steps: [addAssetStep, chainBranchStep, stargateBridgeStep, aaveSupplyStep],
  }
  const segments = new WorkflowInstance(workflow).getWorkflowSegments()
  t.snapshot(segments)
})

const aBigWorkflow: Workflow = {
  steps: [
    {
      stepId: 'chainBranch',
      type: 'chain-branch',
      currentChain: 'optimism',
      ifYes: 'sgArbitrum',
      ifNo: 'sgOptimism',
    },
    {
      stepId: 'sgArbitrum',
      type: 'stargate-bridge',
      destinationChain: 'arbitrum',
      destinationGasUnits: 1000000,
      destinationUserAddress: '0x1234567890123456789012345678901234567890',
      inputAsset: {
        asset: {
          type: 'native',
        },
        amount: 1,
      },
      maxSlippagePercent: 0.04,
      nextStepId: 'aave',
    },
    {
      stepId: 'sgOptimism',
      type: 'stargate-bridge',
      destinationChain: 'optimism',
      destinationGasUnits: 1000000,
      destinationUserAddress: '0x1234567890123456789012345678901234567890',
      inputAsset: {
        asset: {
          type: 'native',
        },
        amount: 1,
      },
      maxSlippagePercent: 0.04,
      nextStepId: 'aave',
    },
    {
      stepId: 'aave',
      type: 'aave-supply',
      inputAsset: {
        asset: {
          type: 'native',
        },
        amount: 1,
      },
    },
  ],
}

test('handles the same segment appearing on two different chains', t => {
  const segments = new WorkflowInstance(aBigWorkflow).getWorkflowSegments()
  t.snapshot(segments)
})

test('gets the set of all chains', t => {
  const chains = new WorkflowInstance(aBigWorkflow).getChains()
  t.snapshot(chains)
})
