import { NoAsset, Workflow, WorkflowStep, WorkflowStepResult } from '../types'
import { AssetBalances } from './AssetBalances'
import { WorkflowEngine, WorkflowEngineOptions, WorkflowEvent, WorkflowEventType } from './WorkflowEngine'
import { BigNumber } from 'ethers'
import { StepImplFactory } from './StepImplFactory'
import { MockStepsFactory } from './MockWorkflowSteps'
import { OffChainEngineParams, OffChainStepsFactory } from './OffChainWorkflowSteps'

export class OffChainWorkflowEngine implements WorkflowEngine {
  private balances = new AssetBalances()
  private workflow: Workflow
  private stepImplFactory: StepImplFactory
  private options: OffChainEngineParams // TODO name change

  constructor(params: OffChainEngineParams) {
    this.options = params
    this.stepImplFactory = new OffChainStepsFactory(params)
  }

  async execute(workflow: Workflow): Promise<void> {
    this.workflow = workflow
    for (const step of workflow.steps) {
      await this.executeStep(step)
    }
  }

  private async executeStep(step: WorkflowStep) {
    const stepImpl = this.stepImplFactory.getStep(step.stepId)

    // get actual amount for this step
    const [amount, isPercent] = await stepImpl.actualizeAmount(step, this.balances)

    // fire the Submitting event
    const workflowEvent: WorkflowEvent = {
      type: WorkflowEventType.Starting,
      statusMessage: 'Submitting to blockchain',
      workflow: this.workflow,
      steps: [step],
      balances: this.balances.toArray(),
      absoluteInputAmount: amount.toString(),
    }
    this.options.eventHandler(workflowEvent)

    const statusUpdateHandler = (type: WorkflowEventType, statusMessage: string, steps: WorkflowStep[]) => {
      const statusEvent: WorkflowEvent = {
        ...workflowEvent,
        steps,
        type,
        statusMessage,
      }
      this.options.eventHandler(statusEvent)
    }

    // invoke the mock step
    const stepResult = await stepImpl.executeStep(step, amount, statusUpdateHandler)

    // adjust balances
    if (isPercent) {
      this.balances.debit(step.inputAsset, amount)
    }
    if (step.outputAsset !== NoAsset) {
      this.balances.credit(step.outputAsset, BigNumber.from(stepResult.outputAmount))
    }

    // fire the Completed event
    const completedEvent: WorkflowEvent = {
      ...workflowEvent,
      type: WorkflowEventType.Completed,
      statusMessage: 'Step completed',
      balances: this.balances.toArray(),
      result: stepResult,
    }
    this.options.eventHandler(completedEvent)
  }
}
