import { field, vec } from '@dao-xyz/borsh'
import { WorkflowStep } from './WorkflowStep'

export class Workflow {
  constructor(init: Workflow) {
    Object.assign(this, init)
    this.steps = init.steps
  }

  @field({ type: vec(WorkflowStep) })
  steps: WorkflowStep[]
}
