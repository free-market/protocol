import rootLogger from 'loglevel'
const logger = rootLogger.getLogger('PulsexExactInHelper')

import { EncodingContext, EncodedWorkflowStep } from '@freemarket/core'
import { AbstractStepHelper, AssetSchema } from '@freemarket/step-sdk'
import type { PulsexExactIn } from './model'
export const STEP_TYPE_ID_PULSEX_EXACT_IN = 107
import * as ethers from 'ethers'

// on ethereum:
// index 0 = USDT  = 0xdAC17F958D2ee523a2206206994597C13D831ec7
// index 1 = WBTC  = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
// index 2 = WETH  = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

// same address on all nets except celo
export const SWAP_ROUTER_ADDRESS = '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'

interface PulsexRoute {
  encodedPath: string
  portion: string
}

const PulsexRouteSchema = `
  tuple(
    bytes encodedPath,
    int256 portion
  )`

const PulsexExactInActionParamsSchema = `
  tuple(
    ${AssetSchema} toAsset,
    ${PulsexRouteSchema}[] routes,
    int256 minExchangeRate
  )`

const abiCoder = ethers.utils.defaultAbiCoder

export class PulsexExactInHelper extends AbstractStepHelper<PulsexExactIn> {
  async encodeWorkflowStep(context: EncodingContext<PulsexExactIn>): Promise<EncodedWorkflowStep> {
    throw new Error('Method not implemented.')
  }
}
