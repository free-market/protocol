import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { ADDRESS_ZERO, Chain, EncodingContext } from '@freemarket/core'
import { getTestFixture, MockWorkflowInstance, validateAction } from '@freemarket/step-sdk/tslib/testing'
import { TestErc20__factory } from '@freemarket/step-sdk/typechain-types'
import { ChainBranchHelper } from '../tslib/ChainBranchHelper'
import { WorkflowStepStruct, WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'
import { AssetBalanceBranch, ChainBranch } from '../tslib/model'
import { AssetBalanceBranchHelper } from '../tslib/AssetBalanceBranchHelper'
const testAmount = 100

const setup = getTestFixture(hardhat, async baseFixture => {
  const mapStepIdToIndex = new Map<string, number>()
  mapStepIdToIndex.set('stepFoo', -1)
  return { mapStepIdToIndex }
})

describe('AddAsset', async () => {
  it('branches correctly based on chainId', async () => {
    const {
      contracts: { userWorkflowRunner },
      mapStepIdToIndex,
    } = await setup()
    const stepConfig: ChainBranch = {
      type: 'chain-branch',
      currentChain: 'ethereum',
      ifYes: 'stepFoo',
      nextStepId: 'stepBar',
    }
    const helper = new ChainBranchHelper(new MockWorkflowInstance())

    const context: EncodingContext<ChainBranch> = {
      userAddress: '',
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex,
    }
    const encodedForEthereum: WorkflowStepStruct = {
      ...(await helper.encodeWorkflowStep(context)),
      nextStepIndex: -1,
    }
    const workflowEthereum: WorkflowStruct = { workflowRunnerAddress: ADDRESS_ZERO, steps: [encodedForEthereum] }
    await expect(userWorkflowRunner.executeWorkflow(workflowEthereum)).not.to.be.reverted

    stepConfig.currentChain = 'polygon'
    const encodedForPolygon: WorkflowStepStruct = {
      ...(await helper.encodeWorkflowStep(context)),
      nextStepIndex: -1,
    }
    const workflowPoly: WorkflowStruct = { workflowRunnerAddress: ADDRESS_ZERO, steps: [encodedForPolygon] }
    await expect(userWorkflowRunner.executeWorkflow(workflowPoly)).not.to.be.reverted
  })
  it.only('branches correctly based on asset amount', async () => {
    const {
      contracts: { userWorkflowRunner },
      mapStepIdToIndex,
    } = await setup()
    const stepConfig: AssetBalanceBranch = {
      type: 'asset-balance-branch',
      asset: { type: 'native' },
      comparison: 'greater-than',
      amount: '10000',
      ifYes: 'stepFoo',
      nextStepId: 'stepBar',
    }
    const helper = new AssetBalanceBranchHelper(new MockWorkflowInstance())

    const context: EncodingContext<AssetBalanceBranch> = {
      userAddress: '',
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex,
    }
    const encoded: WorkflowStepStruct = {
      ...(await helper.encodeWorkflowStep(context)),
      nextStepIndex: -1,
    }
    const workflow: WorkflowStruct = { workflowRunnerAddress: ADDRESS_ZERO, steps: [encoded] }
    await expect(userWorkflowRunner.executeWorkflow(workflow)).not.to.be.reverted
    await expect(userWorkflowRunner.executeWorkflow(workflow, { value: '1000000000000000000' })).not.to.be.reverted
  })
})
