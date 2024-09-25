/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai'
import hre, { ethers, deployments } from 'hardhat'
import { MAINNET_EZETH_ADDRESS, RenzoDepositEthForEzEth } from '../tslib'
import { STEP_TYPE_ID_RENZO_ETH_TO_EZETH } from '@freemarket/core/tslib/step-ids'
import { ADDRESS_ZERO, ASSET_TYPE_NATIVE, AssetReference, createStandardProvider, EncodingContext, IERC20__factory, TEN_BIG } from '@freemarket/core'
import { confirmTx, getTestFixture, getUsdt, MockWorkflowInstance, validateAction, WETH_ADDRESS } from '@freemarket/step-sdk/tslib/testing'
import { Weth__factory, formatNumber } from '@freemarket/step-sdk'
import { WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'
import { DepositEthForEZEthAction } from '../typechain-types'

import Big from 'big.js'
import { Signer } from '@ethersproject/abstract-signer'
import exp from 'constants'
import { encodeDepositEthForEzEthParams, RenzoDepositEthForEzEthHelper } from '../tslib/RenzoDepositEthForEzEthHelper'
import { parseEther } from 'ethers/lib/utils'


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
  const mockWorkflowInstance = new MockWorkflowInstance()
  const stdProvider = createStandardProvider(otherUserSigner.provider!, otherUserSigner)
  const helper = new RenzoDepositEthForEzEthHelper(mockWorkflowInstance, stdProvider)
  return {
    contracts: { ezEth, depositEthForEZEthAction, userWorkflowRunner, frontDoor },
    hre,
    helper,
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
      helper,
      otherUserSigner
    } = await setup()
    const ethToTrade = parseEther("1").toBigInt()
    const minEzEthToReceive = parseEther("0.9").toBigInt()

    const stepConfig : RenzoDepositEthForEzEth =  {
      type: 'renzo-deposit-eth',
      source: 'caller',
      ethToTrade,
      minEzEthToReceive
    }
    const context: EncodingContext<RenzoDepositEthForEzEth> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }

    const encoded = await helper.encodeWorkflowStep(context)
    console.log(`otherUser ${otherUser}`)
    const ezEthBefore = await ezEth.balanceOf(otherUser)
    
    const workflow: WorkflowStruct = {
      workflowRunnerAddress: ADDRESS_ZERO,
      steps: [
        {
          ...encoded,
          nextStepIndex: -1,
        },
      ],
      beforeAll: [],
      afterAll: [],
    }
    const expectedEzEth = await depositEthForEZEthAction.calculateEzEthMintAmount(ethToTrade) 
    expect(expectedEzEth).gt(minEzEthToReceive).lte(ethToTrade)
    // assuming ETH->ezETH exchange rate < 1:
    // should fail requesting testAmount since ezEth amount will be less
    await expect(userWorkflowRunner.executeWorkflow(workflow, {value : ethToTrade})).to.throw
    // reduce output to minEzEthToReceive. should work now
    workflow.steps[0].argData = encodeDepositEthForEzEthParams(minEzEthToReceive)
    console.log(`submitting workflow tx`)
    const tx = await userWorkflowRunner.executeWorkflow(workflow, {value : ethToTrade, gasLimit: 3000000})
    console.log(`submited workflow submit tx: ${JSON.stringify(tx)}`)
    const txr = await tx.wait()
    console.log(`workflow used gas: ${txr.gasUsed}`)
    const ezEthAfter = await ezEth.balanceOf(otherUser)
    console.log(`ezEthBefore ${ezEthBefore} ezEthAfter ${ezEthAfter}`)
    expect(ezEthAfter.sub(ezEthBefore).gte(minEzEthToReceive))
  })
 

})
