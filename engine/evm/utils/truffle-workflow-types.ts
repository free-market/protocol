import { WorkflowRunnerInstance } from '../types/truffle-contracts'

// need an instance to extract types
function f<T1, T2>(arg1: T1, arg2: T2) {
  const x = {} as unknown as WorkflowRunnerInstance
  type ArgTypes = Parameters<typeof x.executeWorkflow>
  return {} as unknown as ArgTypes
}
type ExecuteWorkflowArgTypes = ReturnType<typeof f>
export type Workflow = ExecuteWorkflowArgTypes[0]
export type WorkflowParams = ExecuteWorkflowArgTypes[1]
