/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai'
import hre, { ethers, deployments } from 'hardhat'
import { MAINNET_STETH_ADDRESS, MAINNET_WSTETH_ADDRESS, encodeDepositEthForStEthParams, encodeWrapParams } from '../tslib'
import { STEP_TYPE_ID_LIDO_ETH_TO_STETH, STEP_TYPE_ID_LIDO_STETH_TO_WSTETH, STEP_TYPE_ID_LIDO_WSTETH_TO_STETH } from '../../step-ids'
import { ADDRESS_ZERO, ASSET_TYPE_ERC20, ASSET_TYPE_NATIVE, AssetReference, createStandardProvider, EncodingContext, IERC20__factory, TEN_BIG } from '@freemarket/core'
import { confirmTx, getTestFixture, getUsdt, MockWorkflowInstance, validateAction, WETH_ADDRESS } from '@freemarket/step-sdk/tslib/testing'
import { WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'
import { DepositEthForStEthAction } from '../typechain-types'


const setup = getTestFixture(hre, async baseFixture => {
  const {
    signers: { otherUserSigner },
    contracts: { frontDoor, userWorkflowRunner },
    users: { otherUser },
  } = baseFixture

  // deploy the contract
  await deployments.fixture('DepositEthForEZEthAction')

  // get a reference to the deployed contract with otherUser as the signer
  const depositEthForStEthAction = <DepositEthForStEthAction>await ethers.getContract('DepositEthForStEthAction', otherUserSigner)
  const stEth = IERC20__factory.connect(MAINNET_STETH_ADDRESS, otherUserSigner)
  const wstEth = IERC20__factory.connect(MAINNET_WSTETH_ADDRESS, otherUserSigner)

  return {
    contracts: { stEth, wstEth, depositEthForStEthAction, userWorkflowRunner, frontDoor },
    hre,
    otherUser,
    otherUserSigner,
  }
})

describe('Lido', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, depositEthForStEthAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_LIDO_ETH_TO_STETH, depositEthForStEthAction.address)
  })
  it('Deposit ETH into stEth via runner', async () => {
    const {
      contracts: { stEth, wstEth, userWorkflowRunner },
      otherUser,
      otherUserSigner
    } = await setup()
    console.log(`otherUser ${otherUser}`)
    const testAmount = ethers.utils.parseEther("0.001")
    let stEthBefore = await stEth.balanceOf(otherUser)
    const minStEth = testAmount.sub(100)
    
    const workflow: WorkflowStruct = {
      workflowRunnerAddress: ADDRESS_ZERO,
      steps: [
        {
          stepTypeId: STEP_TYPE_ID_LIDO_ETH_TO_STETH,
          stepAddress: ADDRESS_ZERO,
          inputAssets: [
            {
              sourceIsCaller: true,
              amountIsPercent: false,
              asset: {
                assetType: ASSET_TYPE_NATIVE,
                assetAddress: ADDRESS_ZERO,
              },
              amount: testAmount,
            },
          ],
          argData: encodeDepositEthForStEthParams(testAmount.add(1)),
          nextStepIndex: -1,
        },
      ],
      beforeAll: [],
      afterAll: [],
    }

    expect(userWorkflowRunner.executeWorkflow(workflow, {value : testAmount, gasLimit: 6000000})).to.be.reverted
    // reduce output to minEzEthToReceive. should work now
    workflow.steps[0].argData = encodeDepositEthForStEthParams(minStEth)

    //console.log(`submitting workflow tx`)
    let tx = await userWorkflowRunner.executeWorkflow(workflow, {value : testAmount})
    //console.log(`submited workflow submit tx: ${JSON.stringify(tx)}`)
    let txr = await tx.wait()
    console.log(`workflow used gas: ${txr.gasUsed}`)
    let stEthAfter = await stEth.balanceOf(otherUser)
    console.log(`stEthBefore ${stEthBefore} stEthAfter ${stEthAfter}`)
    expect(stEthAfter.sub(stEthBefore).gte(minStEth))

    // convert the stEth to wstEth

    const workflowStWst: WorkflowStruct = {
      workflowRunnerAddress: ADDRESS_ZERO,
      steps: [
        {
          stepTypeId: STEP_TYPE_ID_LIDO_STETH_TO_WSTETH,
          stepAddress: ADDRESS_ZERO,
          inputAssets: [
            {
              sourceIsCaller: true,
              amountIsPercent: false,
              asset: {
                assetType: ASSET_TYPE_ERC20,
                assetAddress: MAINNET_STETH_ADDRESS,
              },
              amount: stEthAfter,
            },
          ],
          argData: encodeWrapParams(stEthAfter.add(1)),
          nextStepIndex: -1,
        },
      ],
      beforeAll: [],
      afterAll: [],
    }
    const wstEthBefore = await wstEth.balanceOf(otherUser)
    tx = await stEth.approve(userWorkflowRunner.address, stEthAfter)
    await tx.wait()
    expect(userWorkflowRunner.executeWorkflow(workflowStWst)).to.be.reverted
    const minWstEth = stEthAfter.mul(80).div(100)
    console.log(`minWstEth ${minWstEth}`)
    workflowStWst.steps[0].argData = encodeWrapParams(minWstEth)
    tx = await userWorkflowRunner.executeWorkflow(workflowStWst)
    await tx.wait()
    const wstEthAfter = await wstEth.balanceOf(otherUser)
    console.log(`wstEthBefore ${wstEthBefore} wstEthAfter ${wstEthAfter}`)
    expect(wstEthAfter.sub(wstEthBefore)).gte(minWstEth)

    // convert the wstEth back to stEth

    const workflowWstSt: WorkflowStruct = {
      workflowRunnerAddress: ADDRESS_ZERO,
      steps: [
        {
          stepTypeId: STEP_TYPE_ID_LIDO_WSTETH_TO_STETH,
          stepAddress: ADDRESS_ZERO,
          inputAssets: [
            {
              sourceIsCaller: true,
              amountIsPercent: false,
              asset: {
                assetType: ASSET_TYPE_ERC20,
                assetAddress: MAINNET_WSTETH_ADDRESS,
              },
              amount: wstEthAfter,
            },
          ],
          argData: encodeWrapParams(testAmount),
          nextStepIndex: -1,
        },
      ],
      beforeAll: [],
      afterAll: [],
    }
    stEthBefore = await stEth.balanceOf(otherUser)
    // sometimes a few wei is left over
    expect(stEthBefore).lt(100)
    let wstAllowance = await wstEth.allowance(otherUser, userWorkflowRunner.address)
    tx = await wstEth.approve(userWorkflowRunner.address, wstEthAfter)
    await tx.wait()
    console.log(`wstAllowance ${wstAllowance}`)
    // requires too much output stEth
    expect(userWorkflowRunner.executeWorkflow(workflowWstSt)).to.reverted
    workflowWstSt.steps[0].argData = encodeWrapParams(minStEth)
    wstAllowance = await wstEth.allowance(otherUser, userWorkflowRunner.address)
    console.log(`wstAllowance ${wstAllowance}`)
    tx = await userWorkflowRunner.executeWorkflow(workflowWstSt)
    await tx.wait()
    stEthAfter = await stEth.balanceOf(otherUser)
    console.log(`stEthBefore ${stEthBefore} stEthAfter ${stEthAfter}`)
    expect(stEthAfter.sub(stEthBefore)).gte(minStEth)

  })
 

})
