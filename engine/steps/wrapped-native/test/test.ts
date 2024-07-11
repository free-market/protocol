import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { WrapNativeHelper } from '../tslib/wrap-native-helper'
import { STEP_TYPE_ID_UNWRAP_NATIVE, STEP_TYPE_ID_WRAP_NATIVE } from '../../step-ids'
import { ADDRESS_ZERO, createStandardProvider, EncodingContext, IERC20__factory, WORKFLOW_END_STEP_ID } from '@freemarket/core'
import { confirmTx, getTestFixture, MockWorkflowInstance, validateAction } from '@freemarket/step-sdk/tslib/testing'
import { TestErc20__factory } from '@freemarket/step-sdk'
import { UnwrapNativeAction, Weth__factory, WrapNativeAction } from '../typechain-types'
import { getWrappedNativeAddress } from '@freemarket/step-sdk/tslib/getWrappedNativeAddress'
import { IERC20 } from '@freemarket/runner'
import { UnwrapNative, UnwrapNativeHelper, WrapNative } from '../tslib'
import { ContractTransaction } from 'ethers'
import { TransactionReceipt } from '@ethersproject/providers'
import { WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'

const testAmountEth = 1
const testAmountWei = ethers.utils.parseEther(testAmountEth.toString())

const setup = getTestFixture(hardhat, async baseFixture => {
  const {
    users: { otherUser },
    signers: { otherUserSigner },
    contracts: { frontDoor, userWorkflowRunner },
  } = baseFixture

  // deploy the contract
  await deployments.fixture('WrapNativeAction')
  await deployments.fixture('UnwrapNativeAction')

  // get a reference to the deployed contract with otherUser as the signer
  const wrapNativeAction = <WrapNativeAction>await ethers.getContract('WrapNativeAction', otherUserSigner)
  const unwrapNativeAction = <UnwrapNativeAction>await ethers.getContract('UnwrapNativeAction', otherUserSigner)
  const wethAddress = await wrapNativeAction.contractAddress()
  // console.log('wethAddress', wethAddress)
  const weth = Weth__factory.connect(wethAddress, otherUserSigner)
  const mockWorkflowInstance = new MockWorkflowInstance()
  return { contracts: { wrapNativeAction, weth, unwrapNativeAction }, mockWorkflowInstance, wethAddress }
})

describe('Wrapped Native', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, wrapNativeAction, unwrapNativeAction },
    } = await setup()

    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_WRAP_NATIVE, wrapNativeAction.address)
    await validateAction(configManager, STEP_TYPE_ID_UNWRAP_NATIVE, unwrapNativeAction.address)
  })

  it('wraps when invoked directly', async () => {
    const {
      contracts: { wrapNativeAction, weth },
      users: { otherUser },
      mockWorkflowInstance,
      wethAddress,
    } = await setup()

    const stepConfig: WrapNative = {
      type: 'wrap-native',
      amount: testAmountEth,
      source: 'workflow',
    }

    const helper = new WrapNativeHelper(mockWorkflowInstance)
    const context: EncodingContext<WrapNative> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig: stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }
    const encoded = await helper.encodeWorkflowStep(context)
    // console.log(JSON.stringify(encoded, null, 4))

    const { inputAssets, argData } = encoded
    await expect(wrapNativeAction.execute(inputAssets, argData, otherUser, { value: testAmountWei }))
      .to.changeEtherBalance(otherUser, testAmountWei.mul(-1))
      .and.changeTokenBalance(weth, wrapNativeAction.address, testAmountWei)
  })

  it('unwraps when invoked by runner', async () => {
    const {
      contracts: { unwrapNativeAction, weth, userWorkflowRunner },
      users: { otherUser },
      mockWorkflowInstance,
      wethAddress,
    } = await setup()

    const workflow: WorkflowStruct = {
      workflowRunnerAddress: ADDRESS_ZERO,
      steps: [
        {
          stepTypeId: STEP_TYPE_ID_UNWRAP_NATIVE,
          stepAddress: ADDRESS_ZERO,
          inputAssets: [
            {
              sourceIsCaller: true,
              amountIsPercent: false,
              asset: {
                assetType: 1,
                assetAddress: wethAddress,
              },
              amount: testAmountEth,
            },
          ],
          argData: '0x',
          nextStepIndex: -1,
        },
      ],
      beforeAll: [],
      afterAll: [],
    }

    // const stepConfig: UnwrapNative = {
    //   type: 'unwrap-native',
    //   amount: testAmount,
    //   source: 'workflow',
    // }
    // const helper = new UnwrapNativeHelper(mockWorkflowInstance)
    // const context: EncodingContext<UnwrapNative> = {
    //   userAddress: otherUser,
    //   chain: 'ethereum',
    //   stepConfig: stepConfig,
    //   mapStepIdToIndex: new Map<string, number>(),
    // }
    // const encoded = await helper.encodeWorkflowStep(context)

    // transfer some weth to the contract runner (front door actually)
    await confirmTx(weth.deposit({ value: testAmountEth }))
    await confirmTx(weth.approve(userWorkflowRunner.address, testAmountEth))

    await expect(userWorkflowRunner.executeWorkflow(workflow))
      .to.changeEtherBalance(otherUser, testAmountEth)
      .and.changeTokenBalance(weth, otherUser, testAmountEth * -1)
  })
})
