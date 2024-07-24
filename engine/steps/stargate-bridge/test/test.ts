/* eslint-disable no-console */
// import rootLogger from 'loglevel'
import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { StargateBridgeAction } from '../typechain-types'
import { StargateBridgeHelper } from '../tslib/helper'
import { STEP_TYPE_ID_STARGATE_BRIDGE } from '../../step-ids'
import { createStandardProvider, EncodingContext, TEN_BIG, WORKFLOW_END_STEP_ID, assert } from '@freemarket/core'
import { confirmTx, getTestFixture, getUsdc, MockWorkflowInstance, validateAction } from '@freemarket/step-sdk/tslib/testing'
import { getStargateComposerAddress } from '../tslib/stargateContractAddresses'
import { StargateBridge } from '../tslib/model'
import { TestErc20__factory, formatNumber } from '@freemarket/step-sdk'
import Big from 'big.js'

const testAmount = 100
const testAmountFull = 100_000000

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

  // swap 1 eth into usdc
  const { usdc, usdcAddress } = await getUsdc(hardhat, '1000000000000000000', otherUserSigner)

  const testUsdc = TestErc20__factory.connect(USDC_ethereumGoerli, otherUserSigner)
  await (await testUsdc.mint(otherUser, testAmountFull)).wait()

  // transfer to stargateBridgeAction
  await (await testUsdc.transfer(stargateBridgeAction.address, testAmountFull)).wait()

  // create a mock WorkflowInstance and register the test token
  const mockWorkflowInstance = new MockWorkflowInstance()
  mockWorkflowInstance.registerErc20('USDC', usdcAddress, 6)
  mockWorkflowInstance.frontDoorAddress = frontDoor.address

  return {
    contracts: { stargateBridgeAction, testUsdc, usdc },
    mockWorkflowInstance,
    usdcAddress,
  }
})

describe('StargateBridge', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, stargateBridgeAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_STARGATE_BRIDGE, stargateBridgeAction.address)

    const networkInfo = await stargateBridgeAction.provider.getNetwork()
    const expectedRouterAddress = getStargateComposerAddress(networkInfo.chainId)
    const actualComposerAddress = await stargateBridgeAction.stargateComposerAddress()
    expect(actualComposerAddress).to.eq(expectedRouterAddress)
  })

  it('executes', async () => {
    const {
      contracts: { stargateBridgeAction, testUsdc, usdc },
      mockWorkflowInstance,
      users: { otherUser },
      signers: { otherUserSigner },
    } = await setup()

    // create the helper
    assert(otherUserSigner.provider, 'otherUserSigner.provider is undefined')
    const stdProvider = createStandardProvider(otherUserSigner.provider, otherUserSigner)
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
    console.log('encodedStep', JSON.stringify(encodedStep, null, 4))

    // const routerAddr = await stargateBridgeAction.stargateRouterAddress()
    // console.log('routerAddr', routerAddr)

    await confirmTx(usdc.transfer(stargateBridgeAction.address, testAmountFull))

    // invoke stargate
    await expect(
      stargateBridgeAction.execute(encodedStep.inputAssets, encodedStep.argData, otherUser, {
        value: new Big(remittance.amount.toString()).mul(TEN_BIG.pow(18)).toFixed(0),
        gasLimit: 30_000_000,
      })
    ).to.changeTokenBalance(usdc, stargateBridgeAction.address, testAmountFull * -1)

    // run it again just to see gas usage
    await confirmTx(usdc.transfer(stargateBridgeAction.address, testAmountFull))
    const txReceipt = await confirmTx(
      stargateBridgeAction.execute(encodedStep.inputAssets, encodedStep.argData, otherUser, {
        value: new Big(remittance.amount.toString()).mul(TEN_BIG.pow(18)).toFixed(0),
        gasLimit: 30_000_000,
      })
    )

    console.log(`gas units: ${formatNumber(txReceipt.gasUsed, 0, 0, true)}`)
  })
})
