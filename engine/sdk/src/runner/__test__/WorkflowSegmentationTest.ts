import test from 'ava'
import type { Step, Workflow } from '../../model'
import WorkflowRunner from '../WorkflowRunner'

const addAssetStep: Step = {
  stepId: 'addAsset',
  type: 'add-asset',
  asset: {
    type: 'native',
  },
  amount: 1,
}

test('processes a single chain single node workflow', t => {
  const workflow1: Workflow = {
    steps: [addAssetStep],
  }
  const runner = new WorkflowRunner(workflow1)
  const segments = runner.getWorkflowSegments()
  t.snapshot(segments)
})

const aaveSupplyStep: Step = {
  stepId: 'aaveSupply',
  type: 'aave-supply',
  inputAsset: {
    asset: {
      type: 'native',
    },
    amount: 1,
  },
}

test('processes a single chain multi node workflow', t => {
  const workflow2: Workflow = {
    steps: [addAssetStep, aaveSupplyStep],
  }
  const runner = new WorkflowRunner(workflow2)
  const segments = runner.getWorkflowSegments()
  t.snapshot(segments)
})

const stargateBridgeStep: Step = {
  stepId: 'starGate',
  type: 'stargate-bridge',
  destinationChain: 'arbitrum',
  destinationUserAddress: '0x1234567890123456789012345678901234567890',
  inputAsset: {
    asset: {
      type: 'native',
    },
    amount: 1,
  },
  maxSlippagePercent: 0.04,
}

test('processes a multi chain workflow', t => {
  const workflow: Workflow = {
    steps: [addAssetStep, stargateBridgeStep, aaveSupplyStep],
  }
  const runner = new WorkflowRunner(workflow)
  const segments = runner.getWorkflowSegments()
  t.snapshot(segments)
})

const chainBranchStep: Step = {
  stepId: 'chainBranch',
  type: 'chain-branch',
  currentChain: 'arbitrum',
  ifYes: 'aaveSupply',
}

test('handles branch nodes', t => {
  const workflow: Workflow = {
    steps: [addAssetStep, chainBranchStep, stargateBridgeStep, aaveSupplyStep],
  }
  const segments = new WorkflowRunner(workflow).getWorkflowSegments()
  t.snapshot(segments)
})

test('handles the same segment appearing on two different chains', t => {
  const workflow: Workflow = {
    steps: [
      {
        stepId: 'chainBranch',
        type: 'chain-branch',
        currentChain: 'optimism',
        ifYes: 'sgArbitrum',
        ifNo: 'sgOptimism',
      },
      {
        ...stargateBridgeStep,
        stepId: 'sgArbitrum',
        destinationChain: 'arbitrum',
        nextStepId: 'aave',
      },
      {
        ...stargateBridgeStep,
        stepId: 'sgOptimism',
        destinationChain: 'optimism',
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
  const segments = new WorkflowRunner(workflow).getWorkflowSegments()
  t.snapshot(segments)
})
