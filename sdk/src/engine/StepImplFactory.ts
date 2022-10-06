import { StepImpl } from './StepImpl'

export interface StepImplFactory {
  getStep(stepId: string): StepImpl
}
