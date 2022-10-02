import { NoAsset, Workflow, WorkflowStep, WorkflowStepResult } from '../types'
import { AssetBalances } from './AssetBalances'
import { WorkflowEngine, WorkflowEngineOptions, WorkflowEvent, WorkflowEventType } from './WorkflowEngine'
import { BigNumber } from 'ethers'

function sleep(millis: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, millis)
  })
}

export enum MockWorkflowEngineMode {
  SignEveryStep,
  OneClick,
}
interface MockWorkflowEngineOptions extends WorkflowEngineOptions {
  mode: MockWorkflowEngineMode
  minStepDelay?: number
  maxStepDelay?: number
  submitDelay?: number
}

export class MockWorkflowEngine implements WorkflowEngine {
  private options: MockWorkflowEngineOptions
  private balances = new AssetBalances()
  private workflow: Workflow

  constructor(options: MockWorkflowEngineOptions) {
    this.options = options
  }

  async execute(workflow: Workflow): Promise<void> {
    this.workflow = workflow
    for (const step of workflow.steps) {
      await this.executeStep(step)
    }
  }

  private async executeStep(step: WorkflowStep) {
    // get actual amount for this step
    const [amount, isPercent] = this.actualizeAmount(step)

    // fire the Submitting event
    const submittingEvent: WorkflowEvent = {
      type: WorkflowEventType.Starting,
      statusMessage: 'Submitting to blockchain',
      workflow: this.workflow,
      steps: [step],
      balances: this.balances.toArray(),
      absoluteInputAmount: amount.toString(),
    }

    this.options.eventHandler(submittingEvent)

    const statusUpdateHandler = (type: WorkflowEventType, statusMessage: string, steps: WorkflowStep[]) => {
      const statusEvent: WorkflowEvent = {
        ...submittingEvent,
        steps,
        type,
        statusMessage,
      }
      this.options.eventHandler(statusEvent)
    }

    // invoke the mock step
    const stepResult = await this.callMockWorkflowStep(step, amount, statusUpdateHandler)

    console.log('back from  step')

    // adjust balances
    if (isPercent) {
      this.balances.debit(step.inputAsset, amount)
    }
    if (step.outputAsset !== NoAsset) {
      this.balances.credit(step.outputAsset, BigNumber.from(stepResult.outputAmount))
    }

    // fire the Completed event
    const completedEvent: WorkflowEvent = {
      type: WorkflowEventType.Completed,
      statusMessage: 'Step completed',
      workflow: this.workflow,
      steps: [step],
      balances: this.balances.toArray(),
      result: stepResult,
      absoluteInputAmount: amount.toString(),
    }
    this.options.eventHandler(completedEvent)
  }

  private actualizeAmount(step: WorkflowStep): [BigNumber, boolean] {
    if (typeof step.inputAmount === 'number') {
      return [BigNumber.from(step.inputAmount), false]
    }

    const s = step.inputAmount.trim()
    if (s.endsWith('%')) {
      const pctValue = s.slice(0, s.length - 1)
      const pct = BigNumber.from(pctValue)
      const currentBalance = this.balances.get(step.inputAsset)
      if (!currentBalance) {
        throw new Error("invalid workflow: taking percentage of asset that hasn't been seen before")
      }
      const amount = currentBalance.mul(pct).div(100)
      return [amount, true]
    }
    return [BigNumber.from(s), false]
  }

  async callMockWorkflowStep(
    step: WorkflowStep,
    amount: BigNumber,
    statusCallback: (type: WorkflowEventType, statusUpdate: string, steps: WorkflowStep[]) => void
  ) {
    await sleep(this.options.submitDelay || 0)
    statusCallback(WorkflowEventType.Submitted, 'Transaction submitted, waiting for validation', [step])
    await this.mockBlockConfirmDelay()
    switch (step.stepId) {
      case 'weth.wrap':
        return mockExecuteWethWrapUnWrap(step, amount)
      case 'curve.tricrypto.swap':
        return mockExecuteTriCryptoSwap(step, amount)
      case 'wormhole.transfer':
        return mockExecuteWormholeTransfer(step, amount)
      case 'serum.swap':
        return mockExecuteSerumSwap(step, amount)
    }
    throw new Error('unknown stepId: ' + step.stepId)
  }

  async mockBlockConfirmDelay() {
    const { minStepDelay, maxStepDelay } = this.options
    if (minStepDelay) {
      let delay = minStepDelay
      if (maxStepDelay) {
        delay += Math.floor(Math.random() * (maxStepDelay - minStepDelay))
      }

      await sleep(delay)
    }
  }
}

function randomGas() {
  return (30.0 + Math.random() * 10.0).toString()
}

export async function mockExecuteWethWrapUnWrap(step: WorkflowStep, amount: BigNumber): Promise<WorkflowStepResult> {
  return {
    outputAmount: amount.toString(),
    gasCost: '10',
    exchangeFee: '0',
  }
}
const ethInUsd = BigNumber.from(1333)
const tenBigNumber = BigNumber.from(10)
export async function mockExecuteTriCryptoSwap(step: WorkflowStep, amount: BigNumber): Promise<WorkflowStepResult> {
  const decimalDelta = BigNumber.from(step.inputAsset.info.decimals - step.outputAsset.info.decimals)
  const amountOutput = ethInUsd.mul(amount).div(tenBigNumber.pow(decimalDelta))
  return {
    outputAmount: amountOutput.toString(),
    gasCost: randomGas(),
    exchangeFee: '0',
  }
}

export async function mockExecuteWormholeTransfer(step: WorkflowStep, amount: BigNumber): Promise<WorkflowStepResult> {
  return {
    outputAmount: amount.toString(),
    gasCost: randomGas(),
    exchangeFee: '0',
  }
}

export async function mockExecuteSerumSwap(step: WorkflowStep, amount: BigNumber): Promise<WorkflowStepResult> {
  return {
    outputAmount: amount.toString(),
    gasCost: randomGas(),
    exchangeFee: '0',
  }
}
