import {
  EncodingContext,
  EncodedWorkflowStep,
  sdkAssetAmountToEvmInputAmount,
  assert,
  ADDRESS_ZERO,
  EvmAssetType,
  AssetAmount,
  Asset,
  sdkAssetToEvmAsset,
  AssetReference,
} from '@freemarket/core'
import { AbstractStepHelper } from '@freemarket/step-sdk'
import type { UniswapExactIn, UniswapExactOut } from './model'

export const STEP_TYPE_ID = 104

// on ethereum:
// index 0 = USDT  = 0xdAC17F958D2ee523a2206206994597C13D831ec7
// index 1 = WBTC  = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
// index 2 = WETH  = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

export class UniswapExactInHelper extends AbstractStepHelper<UniswapExactIn> {
  async encodeWorkflowStep(context: EncodingContext<UniswapExactIn>): Promise<EncodedWorkflowStep> {
    const { chain, stepConfig } = context
    const { inputSymbol, outputSymbol, inputAmount } = stepConfig

    const inputAssetAmount: AssetAmount = {
      asset: {
        type: 'fungible-token',
        symbol: inputSymbol,
      },
      amount: context.stepConfig.inputAmount,
    }

    const outputAsset: AssetReference = {
      type: 'fungible-token',
      symbol: outputSymbol,
    }

    const evmInputAmount = await sdkAssetAmountToEvmInputAmount(inputAssetAmount, chain, this.instance)
    const asset = await this.instance.dereferenceAsset(outputAsset, chain)
    const evmOutputAsset = sdkAssetToEvmAsset(asset, chain)

    return {
      stepTypeId: STEP_TYPE_ID,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [evmInputAmount],
      outputAssets: [evmOutputAsset],
      data: '0x',
    }
  }
}
