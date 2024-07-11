/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai'
import hre, { ethers, deployments } from 'hardhat'
import { MAINNET_EZETH_ADDRESS } from '../tslib'
import { STEP_TYPE_ID_RENZO_ETH_TO_EZETH } from '../../step-ids'
import { ADDRESS_ZERO, ASSET_TYPE_NATIVE, AssetReference, createStandardProvider, EncodingContext, IERC20__factory, TEN_BIG } from '@freemarket/core'
import { confirmTx, getTestFixture, getUsdt, MockWorkflowInstance, validateAction, WETH_ADDRESS } from '@freemarket/step-sdk/tslib/testing'
import { Weth__factory, formatNumber } from '@freemarket/step-sdk'
import { encodeDepositEthForEzEthParams } from '../tslib/model'
import { WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'
import { DepositEthForEZEthAction } from '../typechain-types'

import Big from 'big.js'
import { Signer } from '@ethersproject/abstract-signer'
import exp from 'constants'


const setup = getTestFixture(hre, async baseFixture => {
  const {
    signers: { otherUserSigner },
    contracts: { frontDoor, userWorkflowRunner },
    users: { otherUser },
  } = baseFixture

  // deploy the contract
  await deployments.fixture('DepositEthForEZEthAction')

  // get a reference to the deployed contract with otherUser as the signer
  const depositEthForEZEthAction = <DepositEthForEZEthAction>await ethers.getContract('DepositEthForEZEthAction', otherUserSigner)
  const ezEth = IERC20__factory.connect(MAINNET_EZETH_ADDRESS, otherUserSigner)

  return {
    contracts: { ezEth, depositEthForEZEthAction, userWorkflowRunner, frontDoor },
    hre,
    otherUser,
    otherUserSigner,
  }
})

describe('Renzo', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, depositEthForEZEthAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_RENZO_ETH_TO_EZETH, depositEthForEZEthAction.address)
  })
  it('Deposit ETH into ezEth via runner', async () => {
    const {
      contracts: { ezEth, configManager, depositEthForEZEthAction, userWorkflowRunner },
      otherUser,
      otherUserSigner
    } = await setup()
    console.log(`otherUser ${otherUser}`)
    const testAmount = ethers.utils.parseEther("0.001")
    const ezEthBefore = await ezEth.balanceOf(otherUser)
    const minEzEthToReceive = testAmount.div(2)
    
    const workflow: WorkflowStruct = {
      workflowRunnerAddress: ADDRESS_ZERO,
      steps: [
        {
          stepTypeId: STEP_TYPE_ID_RENZO_ETH_TO_EZETH,
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
          argData: encodeDepositEthForEzEthParams(testAmount),
          nextStepIndex: -1,
        },
      ],
      beforeAll: [],
      afterAll: [],
    }
    const expectedEzEth = await depositEthForEZEthAction.calculateEzEthMintAmount(testAmount) 
    expect(expectedEzEth).gt(minEzEthToReceive).lte(testAmount)
    // assuming ETH->ezETH exchange rate < 1:
    // should fail requesting testAmount since ezEth amount will be less
    expect(userWorkflowRunner.executeWorkflow(workflow, {value : testAmount})).to.reverted
    // reduce output to minEzEthToReceive. should work now
    workflow.steps[0].argData = encodeDepositEthForEzEthParams(minEzEthToReceive)
    console.log(`submitting workflow tx`)
    const tx = await userWorkflowRunner.executeWorkflow(workflow, {value : testAmount, gasLimit: 3000000})
    console.log(`submited workflow submit tx: ${JSON.stringify(tx)}`)
    const txr = await tx.wait()
    console.log(`workflow used gas: ${txr.gasUsed}`)
    const ezEthAfter = await ezEth.balanceOf(otherUser)
    console.log(`ezEthBefore ${ezEthBefore} ezEthAfter ${ezEthAfter}`)
    expect(ezEthAfter.sub(ezEthBefore).gte(minEzEthToReceive))
  })
 

})
