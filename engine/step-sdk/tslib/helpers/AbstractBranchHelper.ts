import { NextSteps, BranchStep, assert, WORKFLOW_END_STEP_ID } from '@freemarket/core'
import { AbstractStepHelper } from './AbstractStepHelper'

export abstract class AbstractBranchHelper<T extends BranchStep> extends AbstractStepHelper<T> {
  getPossibleNextSteps(stepConfig: T): NextSteps | null {
    assert(stepConfig.nextStepId)
    if (stepConfig.nextStepId === WORKFLOW_END_STEP_ID && stepConfig.ifYes === WORKFLOW_END_STEP_ID) {
      return null
    }

    const sameChain = []
    if (stepConfig.ifYes && stepConfig.ifYes !== WORKFLOW_END_STEP_ID) {
      sameChain.push(stepConfig.ifYes)
    }
    const negBranch = stepConfig.nextStepId
    if (negBranch && negBranch !== WORKFLOW_END_STEP_ID) {
      sameChain.push(negBranch)
    }
    return {
      sameChain,
    }
  }
}
