// import rootLogger from 'loglevel'
// rootLogger.enableAll()
import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { StargateBridgeAction } from '../typechain-types'
import { StargateBridgeHelper, STEP_TYPE_ID } from '../tslib/helper'
import { createStandardProvider, EncodingContext, WORKFLOW_END_STEP_ID } from '@freemarket/core'
import { getTestFixture, MockWorkflowInstance, validateAction } from '@freemarket/step-sdk/tslib/testing'
import { getRouterAddress } from '../tslib/getRouterAddress'
import { StargateBridge } from '../tslib/model'
import { TestErc20__factory } from '@freemarket/step-sdk'

const testAmount = 100

const USDC_ethereumGoerli = '0xDf0360Ad8C5ccf25095Aa97ee5F2785c8d848620'

const setup = getTestFixture(hardhat, async baseFixture => {
  const {
    users: { otherUser },
    signers: { otherUserSigner },
    contracts: { frontDoor },
  } = baseFixture

  // deploy the contract
  await deployments.fixture('StargateBridgeAction')

  // get a reference to the deployed contract with otherUser as the signer
  const stargateBridgeAction = <StargateBridgeAction>await ethers.getContract('StargateBridgeAction', otherUserSigner)

  const testUsdc = TestErc20__factory.connect(USDC_ethereumGoerli, otherUserSigner)
  await (await testUsdc.mint(otherUser, testAmount)).wait()

  // transfer to stargateBridgeAction
  await (await testUsdc.transfer(stargateBridgeAction.address, testAmount)).wait()

  // create a mock WorkflowInstance and register the test token
  const mockWorkflowInstance = new MockWorkflowInstance()
  mockWorkflowInstance.registerErc20('USDC', USDC_ethereumGoerli)
  mockWorkflowInstance.testNet = true
  mockWorkflowInstance.frontDoorAddress = frontDoor.address

  return { contracts: { stargateBridgeAction, testUsdc }, mockWorkflowInstance }
})

describe('StargateBridge', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, stargateBridgeAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID, stargateBridgeAction.address)

    const networkInfo = await stargateBridgeAction.provider.getNetwork()
    const expectedRouterAddress = getRouterAddress(networkInfo.chainId.toString())
    const actualRouterAddress = await stargateBridgeAction.stargateRouterAddress()
    expect(actualRouterAddress).to.eq(expectedRouterAddress)
  })

  it('executes', async () => {
    const {
      contracts: { stargateBridgeAction, testUsdc },
      mockWorkflowInstance,
      users: { otherUser },
      signers: { otherUserSigner },
    } = await setup()

    // create the helper
    const stdProvider = createStandardProvider(otherUserSigner.provider!, otherUserSigner)
    const helper = new StargateBridgeHelper(mockWorkflowInstance, stdProvider)

    // the step config
    const step: StargateBridge = {
      type: 'stargate-bridge',
      destinationChain: 'arbitrum',
      destinationGasUnits: '1000000',
      inputAsset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      inputSource: 'caller',
      inputAmount: testAmount,
      maxSlippagePercent: 0.1,
      destinationUserAddress: otherUser,
      nextStepId: WORKFLOW_END_STEP_ID,
      remittanceSource: 'caller',
    }

    const context: EncodingContext<StargateBridge> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig: step,
      mapStepIdToIndex: new Map<string, number>(),
    }

    const remittance = await helper.getRemittance(step)
    // console.log('remittance', JSON.stringify(remittance, null, 4))

    // ask the helper to encode the step
    const encodedStep = await helper.encodeWorkflowStep(context)
    // console.log(JSON.stringify(encodedStep, null, 4))

    const routerAddr = await stargateBridgeAction.stargateRouterAddress()
    // console.log('routerAddr', routerAddr)

    // invoke stargate
    await expect(
      stargateBridgeAction.execute(encodedStep.inputAssets, encodedStep.argData, {
        value: remittance.amount,
      })
    ).to.changeTokenBalance(testUsdc, stargateBridgeAction.address, testAmount * -1)
  })
})
