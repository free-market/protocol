import { JsonRpcProvider } from '@ethersproject/providers'
import test from 'ava'
import type { StargateBridge } from '../../model/steps/StargateBridge'
import { StargateBridgeHelper } from '../StargateBridgeHelper'
import { createStandardProvider } from '../utils'
import dotenv from 'dotenv'

import { shouldRunE2e } from '../../private/test-utils'

dotenv.config()

test('gets required native', async t => {
  if (!shouldRunE2e()) {
    t.pass('skipping')
    return
  }
  const stargateStepConfig: StargateBridge = {
    stepId: 'stargate',
    type: 'stargate-bridge',
    destinationChain: 'arbitrum',
    destinationUserAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    inputAsset: {
      asset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      amount: 1000000,
    },
    maxSlippagePercent: 0.05,
    destinationAdditionalNative: 100000,
    destinationGasUnits: 1000000,
  }
  const providerUrl = process.env['ETHEREUM_GOERLI_URL']
  const ethersProvider = new JsonRpcProvider(providerUrl)
  const standardProvider = createStandardProvider(ethersProvider)
  const sgHelper = new StargateBridgeHelper(standardProvider)

  const result = await sgHelper.getRequiredAssets(stargateStepConfig)
  t.assert(result.length > 0)
})
