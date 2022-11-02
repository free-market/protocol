import { BigNumber } from 'ethers'
import { Asset, AssetAmount, WorkflowAction, WorkflowStep, WorkflowStepResult } from '../types'
import { AssetBalances } from './AssetBalances'
import { StatusCallback, StepImpl } from './StepImpl'
import { TokenStepImpl } from './TokenStepImpl'
import Big from 'big.js'
import { formatMoney } from '../formatMoney'
import { StepImplFactory } from './StepImplFactory'
import { sleepRandom } from '../sleep'
import { WorkflowEventType } from './WorkflowEngine'
import { getAssetInfo } from '../assetInfo'

function randomGas() {
  return (30.0 + Math.random() * 10.0).toString()
}

function toBig(amount: AssetAmount, decimals: number) {
  if (typeof amount === 'number') {
    return Big(amount)
  }
  return Big(formatMoney(amount, decimals))
}

function randomLoss(n: Big): Big {
  const loss = Math.random() / 10000
  const m = 1 - loss
  return n.mul(m)
}

class MockWethStepImpl extends TokenStepImpl {
  async executeAction(step: WorkflowStep, amount: BigNumber, _statusCallback: StatusCallback): Promise<WorkflowStepResult> {
    return {
      outputAmount: amount.toString(),
      gasCost: randomGas(),
      exchangeFee: '0',
    }
  }
}

const ETH_USD = Big('1346')

class MockCurveStepImpl extends TokenStepImpl {
  async executeAction(action: WorkflowAction, amount: BigNumber, _statusCallback: StatusCallback): Promise<WorkflowStepResult> {
    let outputAmount: Big
    const inputAssetInfo = getAssetInfo(action.inputAsset)
    const decimals = inputAssetInfo.decimals
    const inputAmount = toBig(amount.toString(), decimals)
    if (action.actionId === 'curve.tricrypto.swap') {
      if (action.inputAsset.symbol === 'WETH' && action.outputAsset.symbol === 'USDT') {
        outputAmount = inputAmount.mul(ETH_USD)
      } else if (action.inputAsset.symbol === 'USDT' && action.outputAsset.symbol === 'WETH') {
        outputAmount = inputAmount.div(ETH_USD)
      } else {
        outputAmount = inputAmount
      }
    } else {
      outputAmount = inputAmount
    }

    outputAmount = randomLoss(outputAmount)
    const outputAssetInfo = getAssetInfo(action.outputAsset)
    return {
      outputAmount: outputAmount.toFixed(outputAssetInfo.decimals).replace('.', ''),
      gasCost: randomGas(),
      exchangeFee: '0',
    }
  }
}

class MockWormholeStepImpl extends TokenStepImpl {
  async executeAction(step: WorkflowStep, amount: BigNumber, statusCallback: StatusCallback): Promise<WorkflowStepResult> {
    statusCallback(WorkflowEventType.StatusUpdate, 'Waiting for Guardians', [step])
    await sleepRandom(10, 12)
    statusCallback(WorkflowEventType.StatusUpdate, 'Submitting to target chain', [step])
    await sleepRandom(2, 3)
    return {
      outputAmount: amount.toString(),
      gasCost: randomGas(),
      exchangeFee: '0',
    }
  }
}

class MockSerumStepImpl extends TokenStepImpl {
  async executeAction(action: WorkflowAction, amount: BigNumber, _statusCallback: StatusCallback): Promise<WorkflowStepResult> {
    const inputAssetInfo = getAssetInfo(action.inputAsset)
    const inputAmount = toBig(amount.toString(), inputAssetInfo.decimals)
    const outputAmount = randomLoss(inputAmount)
    const outputAssetInfo = getAssetInfo(action.outputAsset)
    return {
      outputAmount: outputAmount.toFixed(outputAssetInfo.decimals).replace('.', ''),
      gasCost: randomGas(),
      exchangeFee: '0',
    }
  }
}

const SOL_USD = Big(33.88)
const MSOL_USD = Big(36.3)
class MockMarinadeStepImpl extends TokenStepImpl {
  async executeAction(action: WorkflowAction, amount: BigNumber, _statusCallback: StatusCallback): Promise<WorkflowStepResult> {
    const inputAssetInfo = getAssetInfo(action.inputAsset)
    const inputAmount = toBig(amount.toString(), inputAssetInfo.decimals)
    let outputAmount: Big
    if (action.inputAsset.symbol === 'mSOL') {
      // convert to USD then to SOL
      outputAmount = inputAmount.mul(MSOL_USD).div(SOL_USD)
    } else {
      // convert to USD then to mSOL
      outputAmount = inputAmount.mul(SOL_USD).div(MSOL_USD)
    }
    outputAmount = randomLoss(outputAmount)
    const outputAssetInfo = getAssetInfo(action.outputAsset)
    return {
      outputAmount: outputAmount.toFixed(outputAssetInfo.decimals).replace('.', ''),
      gasCost: randomGas(),
      exchangeFee: '0',
    }
  }
}

const COLLATERALIZATION_RATE = Big(1.5)

const BIG_TEN = Big(10)

class MockMangoStepImpl implements StepImpl {
  async actualizeAmount(action: WorkflowAction, assetBalances: AssetBalances): Promise<[BigNumber, boolean]> {
    if (action.actionId === 'mango.withdrawal') {
      // not a realistic simulation of borrowing power for mango.  Their exact algorithm for borrowing 'max' requires research
      // for now assume collator is in the form of USDC
      const mangoUsdcAsset = new Asset('Solana', 'USDCman')
      const mangoUsdcBalance = assetBalances.get(mangoUsdcAsset) // <-- this assumes a positive USDC balance and that is the only form of collateral
      if (!mangoUsdcBalance || mangoUsdcBalance.lte(0)) {
        throw new Error('no collateral to borrow against')
      }
      const mangoUsdcAssetInfo = getAssetInfo(mangoUsdcAsset)
      const collateral = toBig(mangoUsdcBalance.toString(), mangoUsdcAssetInfo.decimals)
      // 150% collateralization
      const sol = collateral.div(COLLATERALIZATION_RATE).div(SOL_USD)
      const outputAssetInfo = getAssetInfo(action.outputAsset)
      const solDecimalMoved = sol.mul(BIG_TEN.pow(outputAssetInfo.decimals))
      const s = solDecimalMoved.toFixed(0)
      const bn = BigNumber.from(s)
      return [bn, true]
    } else {
      let s = action.inputAmount
      if (typeof s === 'number') {
        throw new Error('numbers not supported')
      }
      s = s.trim()
      if (!s.endsWith('%')) {
        throw new Error('absolute values not supported')
      }
      const pctValue = s.slice(0, s.length - 1)
      const pct = BigNumber.from(pctValue)
      const currentBalance = assetBalances.get(action.inputAsset)
      if (!currentBalance) {
        throw new Error("invalid workflow: taking percentage of asset that hasn't been seen before")
      }
      const amount = currentBalance.mul(pct).div(100)
      return [amount, true]
    }
  }

  async executeAction(action: WorkflowAction, amount: BigNumber, _statusCallback: StatusCallback): Promise<WorkflowStepResult> {
    const inputAssetInfo = getAssetInfo(action.inputAsset)
    const inputAmount = toBig(amount.toString(), inputAssetInfo.decimals)
    const outputAmount = randomLoss(inputAmount)
    const outputAssetInfo = getAssetInfo(action.outputAsset)
    return {
      outputAmount: outputAmount.toFixed(outputAssetInfo.decimals).replace('.', ''),
      gasCost: randomGas(),
      exchangeFee: '0',
    }
  }
}

type MockStepsObj = { [stepId: string]: StepImpl }
const MOCK_STEPS: MockStepsObj = {
  'weth.wrap': new MockWethStepImpl(),
  'weth.unwrap': new MockWethStepImpl(),
  'curve.3pool.swap': new MockCurveStepImpl(),
  'curve.tricrypto.swap': new MockCurveStepImpl(),
  'wormhole.transfer': new MockWormholeStepImpl(),
  'serum.swap': new MockSerumStepImpl(),
  'mango.deposit': new MockMangoStepImpl(),
  'mango.withdrawal': new MockMangoStepImpl(),
  'marinade.stake': new MockMarinadeStepImpl(),
  'marinade.unstake': new MockMarinadeStepImpl(),
}

export class MockStepsFactory implements StepImplFactory {
  getStep(stepId: string): StepImpl {
    const rv = MOCK_STEPS[stepId]
    if (rv) {
      return rv
    }
    throw new Error('unknown stepId: ' + stepId)
  }
}
