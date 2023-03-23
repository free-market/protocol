import z from 'zod'
import { aaveSupplySchema } from '@freemarket/aave'
import { stargateBridgeSchema } from '@freemarket/stargate-bridge'
import { addAssetSchema } from '@freemarket/add-asset'
import { aaveWithdrawalSchema, payGelatoRelaySchema, uniswapExactOutSchema } from './steps'
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
