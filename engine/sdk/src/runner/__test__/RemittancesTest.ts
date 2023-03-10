import test from 'ava'
import { JsonRpcProvider } from '@ethersproject/providers'
import { createStandardProvider } from '../../helpers/utils'
import { WorkflowRunner } from '../WorkflowRunner'
import type { StargateBridge, Step } from '../../model'
import dotenv from 'dotenv'
import { assert, getStandardProvider, shouldRunE2e } from '../../private/test-utils'

dotenv.config()

const stargateStep: StargateBridge = {
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

test('gets remittances', async t => {
  if (!shouldRunE2e()) {
    t.pass('skipping')
    return
  }
  const providerUrl = process.env['ETHEREUM_GOERLI_URL']
  const ethersProvider = new JsonRpcProvider(providerUrl)
  const standardProvider = createStandardProvider(ethersProvider)
  const runner = new WorkflowRunner({ steps: [stargateStep] })
  runner.setProvider('start-chain', standardProvider)
  const remittances = await runner.getRemittances()
  t.snapshot(remittances)
})

const addAssetStep: Step = {
  type: 'add-asset',
  asset: { type: 'native' },
  amount: '{{ remittances.stargate.amount }}',
}

test('validates parameters that refer to remittances', async t => {
  if (!shouldRunE2e()) {
    t.pass('skipping')
    return
  }
  const standardProvider = getStandardProvider()
  const runner = new WorkflowRunner({ steps: [addAssetStep, stargateStep] })
  runner.setProvider('start-chain', standardProvider)
  const appliedRunner = await runner.applyArguments()
  const appliedWorkflow = appliedRunner.getWorkflow()
  const appliedStep = appliedWorkflow.steps[0]
  assert(t, appliedStep.type === 'add-asset')
  const amount = appliedStep.amount
  assert(t, typeof amount === 'string')
  t.assert(/^\d+$/.test(amount))
})
