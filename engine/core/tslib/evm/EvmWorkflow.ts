import type { EvmWorkflowStep } from './EvmWorkflowStep'

export interface EvmWorkflow {
  workflowRunnerAddress: string
  steps: EvmWorkflowStep[]
}
