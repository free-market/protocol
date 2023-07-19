import type { EvmWorkflowStep } from './EvmWorkflowStep'

export interface EvmBeforeAfter {
  stepTypeId: string | number
  stepAddress: string
  argData: string
}

export interface EvmWorkflow {
  workflowRunnerAddress: string
  steps: EvmWorkflowStep[]
  beforeAll: EvmBeforeAfter[]
  afterAll: EvmBeforeAfter[]
}
