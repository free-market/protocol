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

let noRandom = false
export function mockStepsNoRandom() {
  noRandom = true
}

function randomGas() {
  if (noRandom) {
    return '10'
  }
  return (30.0 + Math.random() * 10.0).toString()
}

function toBig(amount: AssetAmount, decimals: number) {
  if (typeof amount === 'number') {
    return Big(amount)
  }
  return Big(formatMoney(amount, decimals))
}

function randomLoss(n: Big): Big {
  if (noRandom) {
    return n
  }
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
const BTC_USD = Big('16123')

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

class MockOneInchSwapImpl extends TokenStepImpl {
  async executeAction(action: WorkflowAction, amount: BigNumber, _statusCallback: StatusCallback): Promise<WorkflowStepResult> {
    let outputAmount: Big
    const inputAssetInfo = getAssetInfo(action.inputAsset)
    const decimals = inputAssetInfo.decimals
    const inputAmount = toBig(amount.toString(), decimals)
    if (action.inputAsset.symbol === 'WBTC' && action.outputAsset.symbol === 'USDC') {
      outputAmount = inputAmount.mul(BTC_USD)
    } else if (action.inputAsset.symbol === 'USDC' && action.outputAsset.symbol === 'WBTC') {
      outputAmount = inputAmount.div(BTC_USD)
    } else {
      throw new Error('not mocked')
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

class MockOceanDexSwap extends TokenStepImpl {
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

const COLLATERALIZATION_RATE = Big(1.5)

const BIG_TEN = Big(10)

class AaveStepImpl implements StepImpl {
  async actualizeAmount(action: WorkflowAction, assetBalances: AssetBalances): Promise<[BigNumber, boolean]> {
    if (action.actionId === 'aave.borrow') {
      const aaveUsdcAsset = new Asset('Ethereum', 'USDCaave')
      const aaveUsdcBalance = assetBalances.get(aaveUsdcAsset) // <-- this assumes a positive USDC balance and that is the only form of collateral
      if (!aaveUsdcBalance || aaveUsdcBalance.lte(0)) {
        throw new Error('no collateral to borrow against')
      }
      const aaveUsdcAssetInfo = getAssetInfo(aaveUsdcAsset)
      const collateral = toBig(aaveUsdcBalance.toString(), aaveUsdcAssetInfo.decimals)
      // 150% collateralization
      const sol = collateral.div(COLLATERALIZATION_RATE).div(ETH_USD)
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
    const outputAmount = inputAmount
    const outputAssetInfo = getAssetInfo(action.outputAsset)
    return {
      outputAmount: outputAmount.toFixed(outputAssetInfo.decimals).replace('.', ''),
      gasCost: randomGas(),
      exchangeFee: '0',
    }
  }
}

class MockZkSyncBridge extends TokenStepImpl {
  async executeAction(step: WorkflowStep, amount: BigNumber, statusCallback: StatusCallback): Promise<WorkflowStepResult> {
    statusCallback(WorkflowEventType.StatusUpdate, 'Submitting to target chain', [step])
    await sleepRandom(2, 3)
    return {
      outputAmount: amount.toString(),
      gasCost: randomGas(),
      exchangeFee: '0',
    }
  }
}

type MockStepsObj = { [stepId: string]: StepImpl }
const MOCK_STEPS: MockStepsObj = {
  '1inch.swap': new MockOneInchSwapImpl(),
  'weth.wrap': new MockWethStepImpl(),
  'weth.unwrap': new MockWethStepImpl(),
  'curve.3pool.swap': new MockCurveStepImpl(),
  'curve.tricrypto.swap': new MockCurveStepImpl(),
  'wormhole.transfer': new MockWormholeStepImpl(),
  'zksync.bridge': new MockZkSyncBridge(),
  'aave.stake': new AaveStepImpl(),
  'aave.borrow': new AaveStepImpl(),
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
