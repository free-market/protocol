// like a StepBase but with defined stepId and nextStepId,
// because we are filling in missing ids here to make a fully defined graph
export interface StepNode {
  type: string
  stepId: string
  nextStepId: string
}
