import test from 'ava'
import { Workflow } from '../../model'
import { addMissingStepIds } from '../step-utils'
import { findAllParameterReferences, validateWorkflowParameters } from '../parameter-utils'

test('finds all parameter references in a workflow', t => {
  const workflow: Workflow = {
    steps: [
      {
        type: 'aave-supply',
        inputAsset: '{{ aaveAsset }}',
      },
    ],
  }

  const steps = addMissingStepIds(workflow.steps)
  const map = findAllParameterReferences(steps)
  // const rec = mapToRecord(map)
  // t.snapshot(rec)
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
        inputAsset: '{{ aaveAsset }}', // <-- parameter reference
      },
    ],
  }
  addMissingStepIds(workflow.steps)
  try {
    validateWorkflowParameters(workflow)
    t.fail('it was supposed to throw')
  } catch (e) {
    t.snapshot(e)
  }
})

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
        inputAsset: '{{ aaveAsset }}', // <-- parameter reference, should be type 'asset-amount' here
      },
    ],
  }
  addMissingStepIds(workflow.steps)
  try {
    validateWorkflowParameters(workflow)
    t.fail('it was supposed to throw')
  } catch (e) {
    t.snapshot(e)
  }
})

test('validate when everything is good', t => {
  const workflow: Workflow = {
    parameters: [
      {
        name: 'aaveAsset', // <-- declared parameter
        type: 'asset-amount',
        description: 'The asset and amount to deposit into aave',
      },
    ],
    steps: [
      {
        type: 'aave-supply',
        inputAsset: '{{ aaveAsset }}', // <-- parameter reference
      },
    ],
  }
  addMissingStepIds(workflow.steps)
  validateWorkflowParameters(workflow)
  t.pass()
})
