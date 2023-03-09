import test from 'ava'
import type { Step, Workflow } from '../../model'
import type { AssetReference } from '../../model/AssetReference'
import { assert } from '../../private/test-utils'
import { WorkflowRunner } from '../WorkflowRunner'
import { addAssetStep } from './common'

// any workflow will do
const workflow: Workflow = {
  steps: [addAssetStep],
}

test('resolves fungible token symbols from the default symbols list', async t => {
  const runner = new WorkflowRunner(workflow)
  const usdcAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: 'USDC',
  }
  const asset = await runner.dereferenceAsset(usdcAssetRef, 'ethereum')
  assert(t, asset.type === 'fungible-token')
  t.is(asset.symbol, 'USDC')
  const address = asset.chains['ethereum']?.address
  t.assert(address !== undefined)
})

const fakeTokenAddress = '0x1111111111111111111111111111111111111111'
const fakeTokenSymbol = 'ABCXYZ'
const workflowWithCustomToken: Workflow = {
  fungibleTokens: [
    {
      type: 'fungible-token',
      symbol: fakeTokenSymbol,
      chains: {
        ethereum: {
          address: fakeTokenAddress,
        },
      },
    },
  ],
  steps: [addAssetStep],
}

test('resolves fungible token from workflow.fungibleTokens', async t => {
  const runner = new WorkflowRunner(workflowWithCustomToken)
  const fakeAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: fakeTokenSymbol,
  }
  const asset = await runner.dereferenceAsset(fakeAssetRef, 'ethereum')
  assert(t, asset.type === 'fungible-token')
  t.is(asset.symbol, fakeTokenSymbol)
  const address = asset.chains['ethereum']?.address
  t.is(address, fakeTokenAddress)
})

test("throws when it can't find a symbol", async t => {
  const runner = new WorkflowRunner(workflow)
  const fakeAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: fakeTokenSymbol,
  }
  await t.throwsAsync(() => runner.dereferenceAsset(fakeAssetRef, 'ethereum'))
})

test("throws when it can't find a symbol for a chain", async t => {
  const runner = new WorkflowRunner(workflowWithCustomToken)
  const fakeAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: fakeTokenSymbol,
  }
  await t.throwsAsync(() => runner.dereferenceAsset(fakeAssetRef, 'fantom'))
})

test('dereferences a native', async t => {
  const runner = new WorkflowRunner(workflowWithCustomToken)
  const nativeAssetRef: AssetReference = {
    type: 'native',
  }
  const asset = await runner.dereferenceAsset(nativeAssetRef, 'ethereum')
  t.is(asset.type, 'native')
  t.is(asset.symbol, 'ETH')
})
