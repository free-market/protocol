import { WorkflowStep } from './WorkflowStep'
import { TrustSettings } from './TrustSettings'

export interface EvmWorkflow {
  steps: WorkflowStep[]
  trustSettings: TrustSettings
}
