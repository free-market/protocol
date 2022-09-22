import { Workflow, WorkflowStep, WorkflowStepResult } from '../types'
import { AssetBalances } from './AssetBalances'
import { WorkflowEngine, WorkflowEngineOptions, WorkflowEvent, WorkflowEventType } from './WorkflowEngine'

export enum MockWorkflowEngineMode {
  SignEveryStep,
  OneClick,
}
interface MockWorkflowEngineOptions extends WorkflowEngineOptions {
  mode: MockWorkflowEngineMode
}

const VALID_MONEY_AMOUNT_REGEX = /^[0-9]%?$/

export class MockWorkflowEngine implements WorkflowEngine {
  private options: WorkflowEngineOptions
  private balances = new AssetBalances()

  constructor(options: MockWorkflowEngineOptions) {
    this.options = options
  }

  async execute(workflow: Workflow): Promise<void> {
    for (const step of workflow.steps) {
      await this.executeStep(step)
    }
  }

  private async executeStep(step: WorkflowStep) {
    // get actual amount for this step
    const [amount, isPercent] = this.actualizeAmount(step)

    // fire the Submitting event
    const submittingEvent: WorkflowEvent = {
      type: WorkflowEventType.Submitting,
      steps: [step],
      balances: this.balances.toArray(),
      absoluteInputAmount: amount,
    }
    this.options.eventHandler(submittingEvent)

    // invoke the mock step
    const stepResult = this.callMockWorkflowStep(step, amount)

    // adjust balances
    if (isPercent) {
      this.balances.debit(step.inputAsset, amount)
    }
    if (step.outputAsset !== 'none') {
      this.balances.credit(step.outputAsset, amount)
    }

    // fire the Completed event
    const completedEvent: WorkflowEvent = {
      type: WorkflowEventType.Completed,
      steps: [step],
      balances: this.balances.toArray(),
      result: stepResult,
    }
    this.options.eventHandler(completedEvent)
  }

  private actualizeAmount(step: WorkflowStep): [bigint, boolean] {
    if (typeof step.inputAmount === 'bigint') {
      return [step.inputAmount, false]
    }
    if (typeof step.inputAmount === 'number') {
      return [BigInt(step.inputAmount), false]
    }

    const s = step.inputAmount.trim()
    if (s.endsWith('%')) {
      const pctValue = s.slice(0, s.length - 1)
      const pct = BigInt(pctValue)
      const currentBalance = this.balances.get(step.inputAsset)
      if (!currentBalance) {
        throw new Error("invalid workflow: taking percentage of asset that hasn't been seen before")
      }
      const amount = (currentBalance * pct) / BigInt(100)
      return [amount, true]
    }
    return [BigInt(s), false]
  }

  callMockWorkflowStep(step: WorkflowStep, amount: bigint) {
    switch (step.stepId) {
      case 'weth.wrap':
        return mockExecuteWethWrapUnWrap(step, amount)
      case 'curve.tricrypto.swap':
        return mockExecuteTriCryptoSwap(step, amount)
      case 'wormhole.transfer':
        return mockExecuteWormholeTransfer(step, amount)
      case 'saber.swap':
        return mockExecuteSaberSwap(step, amount)
    }
    throw new Error('unknown stepId: ' + step.stepId)
  }
}

export function mockExecuteWethWrapUnWrap(step: WorkflowStep, amount: bigint): WorkflowStepResult {
  return {
    outputAmount: amount.toString(),
    gasCost: '10',
    exchangeFee: '0',
  }
}
export function mockExecuteTriCryptoSwap(step: WorkflowStep, amount: bigint): WorkflowStepResult {
  return {
    outputAmount: '1347000000000000000000',
    gasCost: '20',
    exchangeFee: '0',
  }
}

export function mockExecuteWormholeTransfer(step: WorkflowStep, amount: bigint): WorkflowStepResult {
  return {
    outputAmount: amount.toString(),
    gasCost: '20',
    exchangeFee: '0',
  }
}

export function mockExecuteSaberSwap(step: WorkflowStep, amount: bigint): WorkflowStepResult {
  return {
    outputAmount: amount.toString(),
    gasCost: '1',
    exchangeFee: '0',
  }
}
