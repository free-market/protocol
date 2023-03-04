import z from 'zod'
import { stargateBridgeSchema } from './steps/StargateBridge'
import { addAssetSchema } from './steps/AddAsset'
import { aaveSupplySchema, aaveWithdrawalSchema, payGelatoRelaySchema, uniswapExactOutSchema } from './steps'
import { chainBranchSchema } from './steps/ChainBranch'
import { assetBalanceBranchSchema } from './steps/AssetBalanceBranch'
import { uniswapExactInSchema } from './steps/UniswapExactAmountIn'
import { wrapNativeSchema } from './steps/WrapNative'
import { unwrapNativeSchema } from './steps/UnwrapNative'

export const stepSchema = z.discriminatedUnion('type', [
  // actions
  aaveSupplySchema,
  aaveWithdrawalSchema,
  addAssetSchema,
  payGelatoRelaySchema,
  uniswapExactInSchema,
  uniswapExactOutSchema,
  unwrapNativeSchema,
  wrapNativeSchema,

  // bridges
  stargateBridgeSchema,

  // branches
  chainBranchSchema,
  assetBalanceBranchSchema,
])

export type Step = z.infer<typeof stepSchema>
