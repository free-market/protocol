import type { ZodError } from 'zod'

export enum WorkflowArgumentProblemType {
  MissingParameter = 'MissingParameter',
  MissingArgument = 'MissingArgument',
  ArgumentTypeMismatch = 'ArgumentTypeMismatch',
  SchemaError = 'SchemaError',
}

export interface WorkflowArgumentProblem {
  type: WorkflowArgumentProblemType
  message: string
  argumentName?: string
  parameterName?: string
  zodError?: ZodError<any>
}

export class WorkflowArgumentError extends Error {
  problems: WorkflowArgumentProblem[]
  constructor(problems: WorkflowArgumentProblem[]) {
    super(problems.map(p => p.message).join('\n'))
    this.problems = problems
  }
}
