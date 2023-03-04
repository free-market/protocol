import { EIP1193Provider } from 'eip1193-provider'
import { Workflow, workflowSchema } from '../model'
import { StepNode } from './StepNode'
import { addMissingStepIds, validateWorkflowSteps } from './step-utils'

export default class WorkflowInstance {
  private workflow: Workflow
  private providers = new Map<string, EIP1193Provider>()
  private steps: StepNode[]
  private mapStepIdToStep = new Map<string, StepNode>()
  constructor(workflow: Workflow | string) {
    if (typeof workflow === 'string') {
      this.workflow = workflowSchema.parse(JSON.parse(workflow))
    } else {
      this.workflow = workflow
    }
    this.steps = this.workflow.steps as StepNode[]
    this.steps = addMissingStepIds(this.workflow.steps)
    validateWorkflowSteps(this.steps)
  }

  setStartChainProvider(provider: EIP1193Provider) {
    this.providers.set('start-chain', provider)
  }
}
