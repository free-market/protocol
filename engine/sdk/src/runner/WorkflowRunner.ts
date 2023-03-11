import type { EncodedWorkflow } from '../EncodedWorkflow'
import type { Chain, Step } from '../model'
import type { ExecutionEventHandler } from './ExecutionEvent'
import type { IWorkflowInstance } from './IWorkflowInstance'
import type { IWorkflowRunner } from './IWorkflowRunner'

export class WorkflowRunner implements IWorkflowRunner {
  private startWorkflow: EncodedWorkflow
  private eventHandlers: ExecutionEventHandler[] = []
  private instance: IWorkflowInstance
  private startChain: Chain

  constructor(instance: IWorkflowInstance, startWorkflow: EncodedWorkflow, startChain: Chain) {
    this.startWorkflow = startWorkflow
    this.instance = instance
    this.startChain = startChain
  }

  addEventHandler(handler: ExecutionEventHandler): void {
    this.eventHandlers.push(handler)
  }
  execute(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
