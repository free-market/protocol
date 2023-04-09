import z from 'zod'
import { aaveSupplySchema } from '@freemarket/aave'
import { aaveWithdrawalSchema, payGelatoRelaySchema } from './steps'
import { addAssetSchema } from '@freemarket/add-asset'
import { assetBalanceBranchSchema, chainBranchSchema } from '@freemarket/base-branches'
import { curveTriCrypto2SwapSchema } from '@freemarket/curve'
import { stargateBridgeSchema } from '@freemarket/stargate-bridge'
import { uniswapExactInSchema, uniswapExactOutSchema } from '@freemarket/uniswap'
import { unwrapNativeSchema, wrapNativeSchema } from '@freemarket/wrapped-native'

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
