import { Trigger } from '../Trigger'
import { Asset, AssetAmount, Workflow, WorkflowAction, WorkflowStep, WorkflowStepResult } from '../types'
export { curveThreePoolSwap, curveTriCryptoSwap } from '../actions/curve'
export { wormholeTokenTransfer } from '../actions/wormhole'
export { wethWrap, wethUnwrap } from '../actions/weth'

/** A callback implelemented by the integrator to determine when to exit a workflow loop based on WorkflowStepResult */
export type DoWhileCallback = (stepResult: WorkflowStepResult) => boolean | Promise<boolean>

export interface StepBuilderArg {
  id?: string
}

export interface ActionBuilderArg extends StepBuilderArg {
  amount?: AssetAmount
}

export type WorkflowStepInput = Omit<WorkflowStep, 'stepId'> & { id?: string }
export type WorkflowActionInput = Omit<WorkflowAction, 'stepId' | 'inputAmount'> & { id?: string; amount?: AssetAmount }

/**
 * A high level interface to concisely define workflows.
 *
 * @example
 * ```TypeScript
 *   const workflow = new WorkflowBuilder()
 *   .addSteps(
 *     wethWrap({ amount: '1000000000000000000' }),
 *     curveTriCryptoSwap({ from: 'WETH', to: 'USDT', amount: '100%' }),
 *     wormholeTokenTransfer({ fromChain: 'Ethereum', fromToken: 'USDT', toChain: 'Solana', amount: '100%' }),
 *     serumSwap({ from: 'USDTet', to: 'USDT', amount: '100%' })
 *   )
 *   .build()
 * ```
 *
 */

export class WorkflowBuilder {
  private trigger?: Trigger
  private steps = [] as WorkflowStep[]
  private inputAssets = [] as Asset[]
  private nextStepId = 1
  constructor(...inputAssets: Asset[]) {
    this.inputAssets = inputAssets
  }

  /**
   * Add a trigger to this workflow.
   * @remarks
   * The trigger will be periodically evaluated based as  scheduled by the provided cron expression.
   * When the trigger condition evaluates to true, the workflow will be executed.
   * @param trigger - the trigger associated with this workflow
   * @returns
   */
  setTrigger(trigger: Trigger): WorkflowBuilder {
    this.trigger = trigger
    return this
  }

  /**
   * Add a sequence of steps to the workflow.
   *
   * @param steps - one or more {@link WorkflowStep} instances. Use factory functions such as {@link wethWrap} to create WorkflowStep instances.
   * @returns `this` instance to allow chaining of method calls
   *
   */
  addSteps(...steps: WorkflowStepInput[]): WorkflowBuilder {
    const stepsWithIds: WorkflowStep[] = steps.map(it => {
      const rv = {
        stepId: it.id || `${this.nextStepId++}`,
        ...it,
      }
      delete rv.id
      const isAction = !!(it as WorkflowActionInput).actionId
      if (isAction) {
        const actionInput = it as WorkflowActionInput
        const actionRv = rv as WorkflowAction
        actionRv.inputAmount = actionInput.amount || '100%'
        delete (actionRv as any).amount
      }
      return rv
    })
    this.steps = this.steps.concat(stepsWithIds)
    return this
  }

  /**
   * Finalize the construction of a {@link Workflow}.
   *
   * @returns a {@link Workflow} instance.
   */
  build(): Workflow {
    return { inputAssets: this.inputAssets, steps: this.steps }
  }

  toWorkflowStep(input: WorkflowStepInput): WorkflowStep {
    const rv = {
      stepId: input.id || `${this.nextStepId++}`,
      ...input,
    }
    delete rv.id
    return rv
  }
  toWorkflowAction(it: WorkflowActionInput): WorkflowAction {
    const rv = this.toWorkflowStep(it)
    const isAction = !!(it as WorkflowActionInput).actionId
    if (isAction) {
      const actionInput = it as WorkflowActionInput
      const actionRv = rv as WorkflowAction
      actionRv.inputAmount = actionInput.amount || '100%'
      delete (actionRv as any).amount
    }
    return rv as WorkflowAction
  }
}
