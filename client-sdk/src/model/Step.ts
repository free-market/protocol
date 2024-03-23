import z, { ZodObject } from 'zod'
import { aaveSupplySchema, aaveWithdrawSchema, aaveBorrowSchema, aaveRepaySchema, aaveLoanHealthSchema } from '@freemarket/aave'
import { payGelatoRelaySchema } from './steps'
import { addAssetSchema } from '@freemarket/add-asset'
import { assetBalanceBranchSchema, chainBranchSchema, previousOutputBranchSchema } from '@freemarket/base-branches'
import { stargateBridgeSchema } from '@freemarket/stargate-bridge'
import {
  uniswapAddLiquiditySchema,
  uniswapExactInSchema,
  uniswapExactOutSchema,
  uniswapMintPositionSchema,
  uniswapPositionExists,
} from '@freemarket/uniswap'
import { unwrapNativeSchema, wrapNativeSchema } from '@freemarket/wrapped-native'
import { oneInchSchema, stripeCryptoOnrampSchema, telegramSendMessageSchema, zeroExSchema } from '@freemarket/roadmap'
import { assert } from '@freemarket/core'

export const stepSchema = z.discriminatedUnion('type', [
  // actions
  aaveSupplySchema,
  aaveWithdrawSchema,
  aaveBorrowSchema,
  aaveRepaySchema,
  aaveLoanHealthSchema,
  // aaveFlashLoanSchema,
  addAssetSchema,
  // curveTriCrypto2SwapSchema,
  payGelatoRelaySchema,
  uniswapExactInSchema,
  uniswapExactOutSchema,
  uniswapMintPositionSchema,
  uniswapAddLiquiditySchema,
  uniswapPositionExists,
  unwrapNativeSchema,
  wrapNativeSchema,
  oneInchSchema,
  telegramSendMessageSchema,
  stripeCryptoOnrampSchema,
  zeroExSchema,

  // bridges
  stargateBridgeSchema,

  // branches
  chainBranchSchema,
  assetBalanceBranchSchema,
  previousOutputBranchSchema,
])

export type Step = z.infer<typeof stepSchema>

export function getSchemaForType(type: string): ZodObject<any> {
  const schema = stepSchema._def.optionsMap.get(type)
  assert(schema)
  return schema
}
