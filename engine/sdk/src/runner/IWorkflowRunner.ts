import type { Arguments } from '../model'
import type { ExecutionEventHandler } from './ExecutionEvent'

export interface IWorkflowRunner {
  addEventHandler(handler: ExecutionEventHandler): void
  execute(args?: Arguments): Promise<void>
}
