import { AssetBalance, Workflow, WorkflowAction, WorkflowStep } from '../types'
import { AssetBalances } from './AssetBalances'
import { WorkflowEngine, WorkflowEngineOptions, WorkflowEvent, WorkflowEventType } from './WorkflowEngine'
import { BigNumber } from 'ethers'
import { StepImplFactory } from './StepImplFactory'
import { MockStepsFactory } from './MockWorkflowSteps'

export { mockStepsNoRandom } from './MockWorkflowSteps'

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
  private stepImplFactory: StepImplFactory = new MockStepsFactory()

  constructor(options: MockWorkflowEngineOptions) {
    this.options = options
  }

  async execute(workflow: Workflow /*, inputAssetAmounts: AssetBalance[]*/): Promise<void> {
    this.workflow = workflow
    // this.validateInputAssets(inputAssetAmounts)
    // this.setInitialBalances(inputAssetAmounts)
    for (const step of workflow.steps) {
      await this.executeStep(step)
    }
  }

  private validateInputAssets(inputAssetAmounts: AssetBalance[]) {
    const inputAssets = new Set<string>()
    const errors: string[] = []
    for (const inputAssetAmount of inputAssetAmounts) {
      const assetStr = inputAssetAmount.asset.toString()
      if (BigNumber.from(inputAssetAmount.balance).isZero()) {
        errors.push('input asset amount is 0 for ' + assetStr)
      }
      if (inputAssets.has(assetStr)) {
        errors.push('input asset specified more than once: ' + assetStr)
      }
      inputAssets.add(assetStr)
    }
    for (const inputAsset of this.workflow.inputAssets) {
      const assetStr = inputAsset.toString()
      if (!inputAssets.has(assetStr)) {
        errors.push('asset is not an input to this workflow: ' + assetStr)
      }
      inputAssets.delete(assetStr)
    }
    inputAssets.forEach(assetStr => errors.push('asset is not an input to this workflow: ' + assetStr))
    if (errors.length > 0) {
      throw new Error(JSON.stringify(errors))
    }
  }

  private setInitialBalances(inputAssetAmounts: AssetBalance[]) {
    for (const inputAssetAmount of inputAssetAmounts) {
      this.balances.credit(inputAssetAmount.asset, BigNumber.from(inputAssetAmount.balance))
    }
  }

  private async executeStep(step: WorkflowStep) {
    // TODO handle branch steps
    const action = step as WorkflowAction
    const stepImpl = this.stepImplFactory.getStep(action.actionId)

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

    // simulate delay from submitting to submitted
    await sleep(this.options.submitDelay || 0)

    // send Submitted event
    statusUpdateHandler(WorkflowEventType.Submitted, 'Waiting for tx confirmation', [step])

    // sleep while tx is getting confirmed
    await this.mockBlockConfirmDelay()

    // invoke the mock step
    const stepResult = await stepImpl.executeAction(step, amount, statusUpdateHandler)

    // adjust balances
    if (isPercent) {
      this.balances.debit(action.inputAsset, amount)
    }
    this.balances.credit(action.outputAsset, BigNumber.from(stepResult.outputAmount))

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

  // private actualizeAmount(step: WorkflowStep): [BigNumber, boolean] {
  //   if (typeof step.inputAmount === 'number') {
  //     return [BigNumber.from(step.inputAmount), false]
  //   }

  //   const s = step.inputAmount.trim()
  //   if (s.endsWith('%')) {
  //     const pctValue = s.slice(0, s.length - 1)
  //     const pct = BigNumber.from(pctValue)
  //     const currentBalance = this.balances.get(step.inputAsset)
  //     if (!currentBalance) {
  //       throw new Error("invalid workflow: taking percentage of asset that hasn't been seen before")
  //     }
  //     const amount = currentBalance.mul(pct).div(100)
  //     return [amount, true]
  //   }
  //   return [BigNumber.from(s), false]
  // }

  // async callMockWorkflowStep(step: WorkflowStep, amount: BigNumber, statusCallback: StatusCallback) {
  //   await sleep(this.options.submitDelay || 0)
  //   statusCallback(WorkflowEventType.Submitted, 'Waiting for tx confirmation', [step])
  //   await this.mockBlockConfirmDelay()
  //   switch (step.stepId) {
  //     case 'weth.wrap':
  //       return mockExecuteWethWrapUnWrap(step, amount)
  //     case 'curve.tricrypto.swap':
  //       return mockExecuteTriCryptoSwap(step, amount)
  //     case 'curve.3pool.swap':
  //       return mockExecuteThreePoolSwap(step, amount)
  //     case 'wormhole.transfer':
  //       return mockExecuteWormholeTransfer(step, amount, statusCallback)
  //     case 'serum.swap':
  //       return mockExecuteSerumSwap(step, amount)
  //     case 'mango.deposit':
  //       return mockExecuteMangoDeposit(step, amount)
  //     case 'mango.withdrawal':
  //       return mockExecuteMangoWithdrawal(step, amount)
  //     case 'marinade.stake':
  //       return mockExecuteMarinadeStake(step, amount)
  //     case 'marinade.unstake':
  //       return mockExecuteMarinadeUnStake(step, amount)
  //   }
  //   throw new Error('unknown stepId: ' + step.stepId)
  // }

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

// async function sleepRandom(min?: number, max?: number) {
//   if (min) {
//     let delay = min
//     if (max) {
//       delay += Math.floor(Math.random() * (max - min))
//     }
//     await sleep(delay)
//   }
// }

// function randomGas() {
//   return (30.0 + Math.random() * 10.0).toString()
// }

// export async function mockExecuteWethWrapUnWrap(step: WorkflowStep, amount: BigNumber): Promise<WorkflowStepResult> {
//   return {
//     outputAmount: amount.toString(),
//     gasCost: '10',
//     exchangeFee: '0',
//   }
// }
// const ethInUsd = BigNumber.from(1333)
// const tenBigNumber = BigNumber.from(10)

// export async function mockExecuteTriCryptoSwap(step: WorkflowStep, amount: BigNumber): Promise<WorkflowStepResult> {
//   const decimalDelta = BigNumber.from(step.inputAsset.info.decimals - step.outputAsset.info.decimals)
//   const amountOutput = ethInUsd.mul(amount).div(tenBigNumber.pow(decimalDelta))
//   return {
//     outputAmount: amountOutput.toString(),
//     gasCost: randomGas(),
//     exchangeFee: '0',
//   }
// }

// export async function mockExecuteThreePoolSwap(step: WorkflowStep, amount: BigNumber): Promise<WorkflowStepResult> {
//   const decimalDelta = BigNumber.from(step.inputAsset.info.decimals - step.outputAsset.info.decimals)
//   const amountOutput = ethInUsd.mul(amount).div(tenBigNumber.pow(decimalDelta))
//   return {
//     outputAmount: amountOutput.toString(),
//     gasCost: randomGas(),
//     exchangeFee: '0',
//   }
// }

// export async function mockExecuteMangoDeposit(step: WorkflowStep, amount: BigNumber): Promise<WorkflowStepResult> {
//   const decimalDelta = BigNumber.from(step.inputAsset.info.decimals - step.outputAsset.info.decimals)
//   const amountOutput = ethInUsd.mul(amount).div(tenBigNumber.pow(decimalDelta))
//   return {
//     outputAmount: amountOutput.toString(),
//     gasCost: randomGas(),
//     exchangeFee: '0',
//   }
// }

// export async function mockExecuteMangoWithdrawal(step: WorkflowStep, amount: BigNumber): Promise<WorkflowStepResult> {
//   const decimalDelta = BigNumber.from(step.inputAsset.info.decimals - step.outputAsset.info.decimals)
//   const amountOutput = ethInUsd.mul(amount).div(tenBigNumber.pow(decimalDelta))
//   return {
//     outputAmount: amountOutput.toString(),
//     gasCost: randomGas(),
//     exchangeFee: '0',
//   }
// }

// export async function mockExecuteMarinadeStake(step: WorkflowStep, amount: BigNumber): Promise<WorkflowStepResult> {
//   const decimalDelta = BigNumber.from(step.inputAsset.info.decimals - step.outputAsset.info.decimals)
//   const amountOutput = ethInUsd.mul(amount).div(tenBigNumber.pow(decimalDelta))
//   return {
//     outputAmount: amountOutput.toString(),
//     gasCost: randomGas(),
//     exchangeFee: '0',
//   }
// }

// export async function mockExecuteMarinadeUnStake(step: WorkflowStep, amount: BigNumber): Promise<WorkflowStepResult> {
//   const decimalDelta = BigNumber.from(step.inputAsset.info.decimals - step.outputAsset.info.decimals)
//   const amountOutput = ethInUsd.mul(amount).div(tenBigNumber.pow(decimalDelta))
//   return {
//     outputAmount: amountOutput.toString(),
//     gasCost: randomGas(),
//     exchangeFee: '0',
//   }
// }

// export async function mockExecuteWormholeTransfer(
//   step: WorkflowStep,
//   amount: BigNumber,
//   statusCallback: StatusCallback
// ): Promise<WorkflowStepResult> {
//   statusCallback(WorkflowEventType.StatusUpdate, 'Waiting for Guardians', [step])
//   await sleepRandom(2000, 4000)
//   statusCallback(WorkflowEventType.StatusUpdate, 'Submitting to target', [step])
//   await sleepRandom(1000, 2000)
//   return {
//     outputAmount: amount.toString(),
//     gasCost: randomGas(),
//     exchangeFee: '0',
//   }
// }

// export async function mockExecuteSerumSwap(step: WorkflowStep, amount: BigNumber): Promise<WorkflowStepResult> {
//   return {
//     outputAmount: amount.toString(),
//     gasCost: randomGas(),
//     exchangeFee: '0',
//   }
// }
