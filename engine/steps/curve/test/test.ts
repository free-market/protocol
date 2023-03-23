// import rootLogger from 'loglevel'
// rootLogger.enableAll()
// import { expect } from 'chai'
// import hardhat, { ethers, deployments } from 'hardhat'
// import { AaveSupplyHelper, STEP_TYPE_ID } from '../tslib/helper'
// import { createStandardProvider, EncodingContext, WORKFLOW_END_STEP_ID } from '@freemarket/core'
// import { TestErc20__factory, getTestFixture, MockWorkflowInstance, validateAction } from '@freemarket/step-sdk'
// import { AaveSupply } from '../tslib/model'

const testAmount = 102

// const setup = getTestFixture(hardhat, async baseFixture => {
//   const {
//     users: { otherUser },
//     signers: { otherUserSigner },
//     contracts: { frontDoor },
//   } = baseFixture

//   // deploy the contract
//   await deployments.fixture('AaveSupplyAction')

//   // get a reference to the deployed contract with otherUser as the signer
//   const aaveSupplyAction = <AaveSupplyAction>await ethers.getContract('AaveSupplyAction', otherUserSigner)

//   // const testUsdc = TestErc20__factory.connect(USDC_ethereumGoerli, otherUserSigner)
//   // await (await testUsdc.mint(otherUser, testAmount)).wait()

//   // // transfer to stargateBridgeAction
//   // await (await testUsdc.transfer(stargateBridgeAction.address, testAmount)).wait()

//   // create a mock WorkflowInstance and register the test token
//   const mockWorkflowInstance = new MockWorkflowInstance()
//   // mockWorkflowInstance.registerErc20('USDC', USDC_ethereumGoerli)
//   // mockWorkflowInstance.testNet = true
//   mockWorkflowInstance.frontDoorAddress = frontDoor.address

//   return { contracts: { aaveSupplyAction }, mockWorkflowInstance }
// })

describe('StargateBridge', async () => {
  it('deploys', async () => {
    // const {
    //   contracts: { userWorkflowRunner, aaveSupplyAction },
    // } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    // await validateAction(userWorkflowRunner, STEP_TYPE_ID, aaveSupplyAction.address)
  })

  it('executes', async () => {})
})
