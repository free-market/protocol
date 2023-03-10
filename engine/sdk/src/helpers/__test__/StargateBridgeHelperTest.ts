import { JsonRpcProvider } from '@ethersproject/providers'
import test from 'ava'
import type { StargateBridge } from '../../model/steps/StargateBridge'
import { createStandardProvider } from '../utils'
import dotenv from 'dotenv'

import { shouldRunE2e } from '../../private/test-utils'
import type { Workflow } from '../../model'
import { WorkflowRunner } from '../../runner/WorkflowRunner'
import { StargateBridgeHelper } from '../StargateBridgeHelper'

dotenv.config()

const destinationUserAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
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
  const runner = new WorkflowRunner({ steps: [stargateStepConfig] })
  runner.setProvider('start-chain', standardProvider)
  const sgHelper = runner['getStepHelper']('start-chain', 'stargate-bridge')
  const result = await sgHelper.getRemittance(runner['steps'][0])
  t.assert(result !== null)
})

test.skip('encodes', async t => {
  const workflow: Workflow = {
    steps: [
      {
        stepId: 'stargate',
        type: 'stargate-bridge',
        destinationChain: 'arbitrum',
        destinationUserAddress,
        inputAsset: {
          asset: {
            type: 'fungible-token',
            symbol: 'USDC',
          },
          amount: '100000',
        },
        maxSlippagePercent: 0.05,
        destinationGasUnits: 1000000,
      },
      {
        type: 'aave-supply',
        inputAsset: {
          asset: {
            type: 'fungible-token',
            symbol: 'USDC',
          },
          amount: '100%',
        },
      },
    ],
  }
  const runner = new WorkflowRunner(workflow)
  const helper = new StargateBridgeHelper(runner)
  const encoded = await helper.encodeWorkflowStep('ethereum', workflow.steps[0] as any)
  t.snapshot(encoded)
})
