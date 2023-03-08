import type { WorkflowSegment } from './WorkflowSegment'

export interface IWorkflowRunner {
  getWorkflowSegments(): WorkflowSegment[]
}
