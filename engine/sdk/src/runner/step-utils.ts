import { StepBase } from '../model'
import { StepNode } from './StepNode'
import { WorkflowValidationError, WorkflowValidationErrorType, WorkflowValidationProblem } from './WorkflowValidationError'

export const WORKFLOW_END_STEP_ID = '__end__'

export function formatStepId(stepIndex: number): string {
  return `__step_${stepIndex}__`
}

export function addMissingStepIds(steps: StepBase[]): StepNode[] {
  for (let i = 0; i < steps.length; ++i) {
    const step = steps[i]
    if (!step.stepId) {
      step.stepId = formatStepId(i)
    }
    if (!step.nextStepId) {
      const isLastNode = i === steps.length - 1
      if (isLastNode) {
        step.nextStepId = WORKFLOW_END_STEP_ID
      } else {
        step.nextStepId = formatStepId(i + 1)
      }
    }
  }
  return steps as StepNode[]
}

export function validateWorkflowSteps(steps: StepNode[]): Map<string, StepNode> {
  const mapStepIdToStep = new Map<string, StepNode>()
  const problems = [] as WorkflowValidationProblem[]

  // ensure all stepIds are unique, and fill in missing stepIds
  for (let i = 0; i < steps.length; ++i) {
    const step = steps[i]
    if (mapStepIdToStep.has(step.stepId)) {
      problems.push({
        type: WorkflowValidationErrorType.NonUniqueStepId,
        stepId: step.stepId,
        step,
        message: `stepId '${step.stepId}' of stepId ${i} is not unique`,
      })
    }
    mapStepIdToStep.set(step.stepId, step as StepNode)
  }

  // validate and fill in missing nextStepIds
  for (let i = 0; i < steps.length; ++i) {
    const step = steps[i]

    if (step.nextStepId !== WORKFLOW_END_STEP_ID && !mapStepIdToStep.has(step.nextStepId)) {
      problems.push({
        type: WorkflowValidationErrorType.NonExistentNextStepId,
        stepId: step.stepId,
        step,
        message: `nextStepId of step #${i} does not exist`,
      })
      problems.push()
    }
  }
  if (problems.length > 0) {
    throw new WorkflowValidationError(problems)
  }
  return mapStepIdToStep
}
