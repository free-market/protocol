import test from 'ava'
import type { StargateBridge } from '../../model/steps/StargateBridge'
import dotenv from 'dotenv'

import { getStandardProvider, shouldRunE2e } from '../../private/test-utils'
import type { Workflow } from '../../model'
import { WorkflowRunner } from '../../runner/WorkflowRunner'

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
  const standardProvider = getStandardProvider()
  const runner = new WorkflowRunner({ steps: [stargateStepConfig] })
  runner.setProvider('start-chain', standardProvider)
  const sgHelper = runner['getStepHelper']('start-chain', 'stargate-bridge')
  const result = await sgHelper.getRemittance(runner['steps'][0])
  t.assert(result !== null)
})

test.only('encodes', async t => {
  if (!shouldRunE2e()) {
    t.pass('skipping')
    return
  }
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
  const startChainProvider = getStandardProvider('ETHEREUM_GOERLI_URL')
  const targetChainProvider = getStandardProvider('ARBITRUM_GOERLI_URL')
  const runner = new WorkflowRunner(workflow)
  runner.setProvider('start-chain', startChainProvider)
  runner.setProvider('arbitrum', targetChainProvider)
  const helper = runner['getStepHelper']('start-chain', 'stargate-bridge')
  // things are potentially too dynamic to do a snapshot here, so just passing if it doesn't reject
  await helper.encodeWorkflowStep('ethereum', runner.getWorkflow().steps[0] as any)
  t.pass()
})
