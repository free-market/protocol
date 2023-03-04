import test, { ExecutionContext } from 'ava'
import { Workflow } from '../../model'
import WorkflowInstance from '../WorkflowInstance'

const testWorkflowJson = `
{
  "steps": []
}
`

test('instantiates a workflow from a json string', t => {
  new WorkflowInstance(testWorkflowJson)
  t.pass()
})

test.only('throws an error when there are duplicate stepIds', t => {
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
