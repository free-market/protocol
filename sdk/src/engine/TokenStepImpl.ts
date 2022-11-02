import { BigNumber } from 'ethers'
import { WorkflowAction, WorkflowStepResult } from '../types'
import { AssetBalances } from './AssetBalances'
import { StatusCallback, StepImpl } from './StepImpl'

/**
 * A common base class that implements actualizeAmount for token based steps
 */
export abstract class TokenStepImpl implements StepImpl {
  abstract executeAction(action: WorkflowAction, amount: BigNumber, statusCallback: StatusCallback): Promise<WorkflowStepResult>

  async actualizeAmount(action: WorkflowAction, assetBalances: AssetBalances): Promise<[BigNumber, boolean]> {
    if (typeof action.inputAmount === 'number') {
      return [BigNumber.from(action.inputAmount), false]
    }
    const s = action.inputAmount.trim()
    if (s.endsWith('%')) {
      const pctValue = s.slice(0, s.length - 1)
      const pct = BigNumber.from(pctValue)
      const currentBalance = assetBalances.get(action.inputAsset)
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
