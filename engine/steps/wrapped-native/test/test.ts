import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { STEP_TYPE_ID, WrapNativeHelper } from '../tslib/wrap-native-helper'
import { createStandardProvider, EncodingContext, IERC20__factory, WORKFLOW_END_STEP_ID } from '@freemarket/core'
import { getTestFixture, MockWorkflowInstance, validateAction } from '@freemarket/step-sdk/tslib/testing'
import { TestErc20__factory } from '@freemarket/step-sdk'
import { Weth__factory, WrapNativeAction } from '../typechain-types'
import { getWrappedNativeAddress } from '../tslib/getWrappedNativeAddress'
import { IERC20 } from '@freemarket/runner'
import { WrapNative } from '../tslib'

const testAmount = 107

const setup = getTestFixture(hardhat, async baseFixture => {
  const {
    users: { otherUser },
    signers: { otherUserSigner },
    contracts: { frontDoor },
  } = baseFixture

  // deploy the contract
  await deployments.fixture('WrapNativeAction')

  // get a reference to the deployed contract with otherUser as the signer
  const wrapNativeAction = <WrapNativeAction>await ethers.getContract('WrapNativeAction', otherUserSigner)
  const wrapContractAddress = await wrapNativeAction.contractAddress()
  console.log('wrapContractAddress', wrapContractAddress)
  const wrapContract = Weth__factory.connect(wrapContractAddress, otherUserSigner)
  // const testUsdc = TestErc20__factory.connect(USDC_ethereumGoerli, otherUserSigner)
  // await (await testUsdc.mint(otherUser, testAmount)).wait()

  // // transfer to stargateBridgeAction
  // await (await testUsdc.transfer(stargateBridgeAction.address, testAmount)).wait()

  // create a mock WorkflowInstance and register the test token
  const mockWorkflowInstance = new MockWorkflowInstance()
  // mockWorkflowInstance.registerErc20('USDC', USDC_ethereumGoerli)
  // mockWorkflowInstance.frontDoorAddress = frontDoor.address

  return { contracts: { wrapNativeAction, wrapContract }, mockWorkflowInstance, wrapContractAddress }
})

describe('Wrapped Native', async () => {
  it('deploys', async () => {
    const {
      contracts: { workflowRunner, wrapNativeAction },
    } = await setup()

    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(workflowRunner, STEP_TYPE_ID, wrapNativeAction.address)
    // const chainId = await hardhat.getChainId()
    // const contractAddress = getWrappedNativeAddress(chainId)
  })

  it('executes', async () => {
    const {
      contracts: { wrapNativeAction, wrapContract },
      users: { otherUser },
      mockWorkflowInstance,
      wrapContractAddress,
    } = await setup()

    const stepConfig: WrapNative = {
      type: 'wrap-native',
      amount: testAmount,
    }

    const helper = new WrapNativeHelper(mockWorkflowInstance)
    const context: EncodingContext<WrapNative> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig: stepConfig,
    }
    const encoded = await helper.encodeWorkflowStep(context)
    // console.log(JSON.stringify(encoded, null, 4))

    const { inputAssets, argData } = encoded
    await expect(wrapNativeAction.execute(inputAssets, argData, { value: testAmount }))
      .to.changeEtherBalance(otherUser, testAmount * -1)
      .and.changeTokenBalance(wrapContract, wrapNativeAction.address, testAmount)
  })
})
