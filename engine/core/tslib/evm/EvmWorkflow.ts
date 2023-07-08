import type { EvmWorkflowStep } from './EvmWorkflowStep'

interface EvmBeforeAfter {
  stepTypeId: string | number
  argData: string
}

export interface EvmWorkflow {
  workflowRunnerAddress: string
  steps: EvmWorkflowStep[]
  beforeAll: EvmBeforeAfter[]
  afterAll: EvmBeforeAfter[]
}
