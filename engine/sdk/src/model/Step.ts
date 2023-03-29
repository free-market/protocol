import z from 'zod'
import { aaveSupplySchema } from '@freemarket/aave'
import { stargateBridgeSchema } from '@freemarket/stargate-bridge'
import { addAssetSchema } from '@freemarket/add-asset'
import { uniswapExactInSchema, uniswapExactOutSchema } from '@freemarket/uniswap'
import { aaveWithdrawalSchema, payGelatoRelaySchema } from './steps'
import { chainBranchSchema } from './steps/ChainBranch'
import { assetBalanceBranchSchema } from './steps/AssetBalanceBranch'
import { wrapNativeSchema, unwrapNativeSchema } from '@freemarket/wrapped-native'
import { curveTriCrypto2SwapSchema } from '@freemarket/curve'

export const stepSchema = z.discriminatedUnion('type', [
  // actions
  aaveSupplySchema,
  aaveWithdrawalSchema,
  addAssetSchema,
  curveTriCrypto2SwapSchema,
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
