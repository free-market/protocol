import { Workflow, WorkflowStep, WorkflowStepResult } from '../types'
export { curveThreePoolSwap, curveTriCryptoSwap } from '../steps/curve'
export { wormholeTokenTransfer } from '../steps/wormhole'
export { saberSwap } from '../steps/saber'
export { mangoDeposit, mangoWithdrawal } from '../steps/mango'
export { wethWrap, wethUnwrap } from '../steps/weth'

/** A callback implelemented by the integrator to determine when to exit a workflow loop based on WorkflowStepResult */
export type DoWhileCallback = (stepResult: WorkflowStepResult) => boolean | Promise<boolean>

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
 *     saberSwap({ from: 'USDTet', to: 'USDT', amount: '100%' })
 *   )
 *   .build()
 * ```
 *
 */

export class WorkflowBuilder {
  private steps = [] as WorkflowStep[]

  // eslint-disable-next-line tsdoc/syntax
  /** @hidden */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  /**
   * Add a sequence of steps to the workflow.
   *
   * @param steps - one or more {@link WorkflowStep} instances. Use factory functions such as {@link wethWrap} to create WorkflowStep instances.
   * @returns `this` instance to allow chaining of method calls
   *
   */
  addSteps(...steps: WorkflowStep[]): WorkflowBuilder {
    this.steps = this.steps.concat(steps)
    return this
  }

  /**
   * Finalize the construction of a {@link Workflow}.
   *
   * @returns a {@link Workflow} instance.
   */
  build(): Workflow {
    return { steps: this.steps }
  }

  /**
   * Loops over  a sequence of {@link WorkflowStep} until a condition is met as determined the callback function.
   * @param steps - the sequence of steps to loop over.  Use factory functions such as {@link wethWrap} to create WorkflowStep instances.
   * @param callback - A function matching the {@link DoWhileCallback} signature that decides if `steps` should be executed again based on the output of the final step.
   * @returns `this` instance to allow chaining of method calls
   */
  doWhile(steps: WorkflowStep[], callback: DoWhileCallback): WorkflowBuilder {
    throw new Error('not implemented')
  }
}
