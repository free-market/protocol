import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { AddAssetAction } from '../typechain-types'
import { AddAssetHelper, STEP_TYPE_ID } from '../tslib/helper'
import { EncodingContext } from '@freemarket/core'
import { getTestFixture, MockWorkflowInstance, validateAction } from '@freemarket/step-sdk/tslib/testing'
import { TestErc20__factory } from '@freemarket/step-sdk/typechain-types'
import { AddAsset } from '../tslib/model'

const testAmount = 100

const setup = getTestFixture(hardhat, async baseFixture => {
  // deploy the contract
  await deployments.fixture('AddAssetAction')

  // get a reference to the deployed contract with otherUser as the signer
  const addAssetAction = <AddAssetAction>await ethers.getContract('AddAssetAction', baseFixture.signers.otherUserSigner)

  // deploy a test token
  const testToken = await (await new TestErc20__factory(baseFixture.signers.otherUserSigner).deploy()).deployed()

  // create a mock WorkflowInstance and register the test token
  const mockWorkflowInstance = new MockWorkflowInstance()
  mockWorkflowInstance.registerErc20('TEST', testToken.address)

  // mint the user some of the test token
  await (await testToken.mint(baseFixture.users.otherUser, testAmount)).wait()
  // approve addAssetAction to transfer the test token
  await (await testToken.approve(addAssetAction.address, testAmount)).wait()

  return { contracts: { addAssetAction, testToken }, mockWorkflowInstance }
})

describe('AddAsset', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, addAssetAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID, addAssetAction.address)
  })

  it('can execute', async () => {
    const {
      contracts: { addAssetAction, testToken },
      users: { otherUser },
      mockWorkflowInstance,
    } = await setup()

    // the step configuration
    const stepConfig: AddAsset = {
      type: 'add-asset',
      asset: {
        type: 'fungible-token',
        symbol: 'TEST',
      },
      amount: testAmount,
    }

    const helper = new AddAssetHelper(mockWorkflowInstance)
    const context: EncodingContext<AddAsset> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig: stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }
    const encoded = await helper.encodeWorkflowStep(context)
    // console.log(encoded)

    const { inputAssets, argData } = encoded
    await expect(addAssetAction.execute(inputAssets, argData)).to.changeTokenBalances(
      testToken,
      [otherUser, addAssetAction.address],
      [testAmount * -1, testAmount]
    )
  })
})
