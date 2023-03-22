import { NextSteps, BranchStep, assert, WORKFLOW_END_STEP_ID } from '@freemarket/core'
import { AbstractStepHelper } from './AbstractStepHelper'

export abstract class AbstractBranchHelper<T extends BranchStep> extends AbstractStepHelper<T> {
  getPossibleNextSteps(stepConfig: T): NextSteps | null {
    assert(stepConfig.nextStepId)
    // I suppose it's possible to be configured like this, and I guess it's not an error
    if (
      stepConfig.nextStepId === WORKFLOW_END_STEP_ID &&
      stepConfig.ifNo === WORKFLOW_END_STEP_ID &&
      stepConfig.ifYes === WORKFLOW_END_STEP_ID
    ) {
      return null
    }

    // I guess ifNo is a synonym for nextStepId
    const sameChain = [stepConfig.ifYes]
    const negBranch = stepConfig.ifNo || stepConfig.nextStepId
    if (negBranch) {
      sameChain.push(negBranch)
    }
    return {
      sameChain,
    }
  }
}
