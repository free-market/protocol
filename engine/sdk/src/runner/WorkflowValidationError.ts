import type { StepBase } from '../model'

export enum WorkflowValidationProblemType {
  NonUniqueStepId = 'NonUniqueStepId',
  NonExistentNextStepId = 'NonExistentNextStepId',
  ParameterTypeMismatch = 'ParameterTypeMismatch',
  InvalidParameterReference = 'InvalidParameterReference',
  UndeclaredParameter = 'UndeclaredParameter',
}

export interface WorkflowValidationProblem {
  type: WorkflowValidationProblemType
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
