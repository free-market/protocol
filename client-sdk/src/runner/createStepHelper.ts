import type { EIP1193Provider } from 'eip1193-provider'
import type { IStepHelper } from '@freemarket/core'

import type { IWorkflowInstance } from './IWorkflowInstance'
import { AaveSupplyHelper, AaveWithdrawHelper, AaveBorrowHelper, AaveRepayHelper } from '@freemarket/aave'
import { AddAssetHelper } from '@freemarket/add-asset'
import { StargateBridgeHelper } from '@freemarket/stargate-bridge'
import { WrapNativeHelper, UnwrapNativeHelper } from '@freemarket/wrapped-native'
import { UniswapExactInHelper } from '@freemarket/uniswap'
import { AssetBalanceBranchHelper, ChainBranchHelper, PreviousOutputBranchHelper } from '@freemarket/base-branches'
import { StubHelper } from '@freemarket/roadmap'

interface StepHelperConstructor {
  new (runner: IWorkflowInstance, provider?: EIP1193Provider): IStepHelper<any>
}

const stepHelpersConstructors: Record<string, StepHelperConstructor> = {
  'aave-supply': AaveSupplyHelper,
  'aave-borrow': AaveBorrowHelper,
  'aave-withdraw': AaveWithdrawHelper,
  'aave-repay': AaveRepayHelper,
  'add-asset': AddAssetHelper,
  'chain-branch': ChainBranchHelper,
  'asset-balance-branch': AssetBalanceBranchHelper,
  'stargate-bridge': StargateBridgeHelper,
  'wrap-native': WrapNativeHelper,
  'unwrap-native': UnwrapNativeHelper,
  'uniswap-exact-in': UniswapExactInHelper,
  'uniswap-mint-position': StubHelper,
  'uniswap-add-liquidity': StubHelper,
  'uniswap-position-exists': StubHelper,
  'previous-output-branch': PreviousOutputBranchHelper,
  '1inch': StubHelper,
}

export function createStepHelper(type: string, runner: IWorkflowInstance) {
  const ctor = stepHelpersConstructors[type]
  if (ctor) {
    return new ctor(runner)
  }
  throw new Error('no helper for type: ' + type)
}
