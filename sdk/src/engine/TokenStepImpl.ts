import { BigNumber } from 'ethers'
import { WorkflowStep, MoneyAmount, WorkflowStepResult, NoAsset } from '../types'
import { AssetBalances } from './AssetBalances'
import { StatusCallback, StepImpl } from './StepImpl'

/**
 * A common base class that implements actualizeAmount for token based steps
 */
export abstract class TokenStepImpl implements StepImpl {
  abstract executeStep(step: WorkflowStep, amount: BigNumber, statusCallback: StatusCallback): Promise<WorkflowStepResult>

  async actualizeAmount(step: WorkflowStep, assetBalances: AssetBalances): Promise<[BigNumber, boolean]> {
    if (typeof step.inputAmount === 'number') {
      return [BigNumber.from(step.inputAmount), false]
    }
    const s = step.inputAmount.trim()
    if (s.endsWith('%')) {
      const pctValue = s.slice(0, s.length - 1)
      const pct = BigNumber.from(pctValue)
      const currentBalance = assetBalances.get(step.inputAsset)
      if (!currentBalance) {
        throw new Error("invalid workflow: taking percentage of asset that hasn't been seen before")
      }
      const amount = currentBalance.mul(pct).div(100)
      return [amount, true]
    }
    return [BigNumber.from(s), false]
  }

  // updateBalances(
  //   step: WorkflowStep,
  //   stepResult: WorkflowStepResult,
  //   assetBalances: AssetBalances,
  //   inputAmount: BigNumber,
  //   isAbsoluteInputAmount: boolean
  // ): void {
  //   if (!isAbsoluteInputAmount) {
  //     assetBalances.debit(step.inputAsset, inputAmount)
  //   }
  //   if (step.outputAsset !== NoAsset) {
  //     assetBalances.credit(step.outputAsset, BigNumber.from(stepResult.outputAmount))
  //   }
  // }
}
