import test from 'ava'
import type { Step, Workflow } from '../../model'
import { WorkflowRunner } from '../WorkflowRunner'

// const addAssetStep: Step = {
//   stepId: 'addAsset',
//   type: 'add-asset',
//   asset: {
//     type: 'native',
//   },
//   amount: 1,
// }

test('processes a single chain single node workflow', t => {
  // const workflow1: Workflow = {
  //   steps: [addAssetStep],
  // }
  // const runner = new WorkflowRunner(workflow1)
  // const segments = runner.getWorkflowSegments()
  // t.snapshot(segments)
  t.pass()
})
