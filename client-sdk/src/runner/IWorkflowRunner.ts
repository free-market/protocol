import type { Arguments } from '../model'
import type { ExecutionEventHandler } from './ExecutionEvent'
import { ExecutionLog } from './ExecutionLog'

export interface IWorkflowRunner {
  addEventHandler(handler: ExecutionEventHandler): void
  execute(args?: Arguments): Promise<ExecutionLog[]>
}
