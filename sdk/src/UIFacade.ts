export enum WorkflowStepArgType {
  StepId = 'StepId',
  String = 'String',
  Number = 'Number',
  Percent = 'Percent',
  Choice = 'Choice',
}

export interface WorkflowStepArgChoice {
  value: string
  label: string
}

export interface WorkflowStepArgMetadata {
  label: string
  type: WorkflowStepArgType
  choices?: WorkflowStepArgChoice[]
  defaultValue?: string
}
