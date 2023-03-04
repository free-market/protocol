import { StepBase } from '../model'

export enum WorkflowValidationErrorType {
  NonUniqueStepId = 'NonUniqueStepId',
  NonExistentNextStepId = 'NonExistentNextStepId',
  InvalidParameterReference = 'InvalidParameterReference',
  UndeclaredParameter = 'UndeclaredParameter',
}

export interface WorkflowValidationProblem {
  type: WorkflowValidationErrorType
  stepId: string
  step: StepBase
  message: string
}

export class WorkflowValidationError extends Error {
  problems: WorkflowValidationProblem[]
  constructor(problems: WorkflowValidationProblem[]) {
    super(problems.map(p => p.message).join('\n'))
    this.problems = problems
  }
}
