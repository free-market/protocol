/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai'
import hre, { ethers, deployments } from 'hardhat'
import { MAINNET_STETH_ADDRESS, STEP_TYPE_ID_LIDO_ETH_TO_STETH } from '../tslib'
import { ADDRESS_ZERO, ASSET_TYPE_NATIVE, AssetReference, createStandardProvider, EncodingContext, IERC20__factory, TEN_BIG } from '@freemarket/core'
import { confirmTx, getTestFixture, getUsdt, MockWorkflowInstance, validateAction, WETH_ADDRESS } from '@freemarket/step-sdk/tslib/testing'
import { Weth__factory, formatNumber } from '@freemarket/step-sdk'
import { WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'
import { DepositEthForStEthAction } from '../typechain-types'
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk'
import Big from 'big.js'
import { Signer } from '@ethersproject/abstract-signer'


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

  return {
    contracts: { stEth, depositEthForStEthAction, userWorkflowRunner, frontDoor },
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
      contracts: { stEth, configManager, depositEthForStEthAction, userWorkflowRunner },
      otherUser,
      otherUserSigner
    } = await setup()
    console.log(`otherUser ${otherUser}`)
    const testAmount = ethers.utils.parseEther("0.001")
    const stEthBefore = await stEth.balanceOf(otherUser)
    // should be 1:1
    const minStEthToReceive = testAmount
    
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
          argData: '0x',
          nextStepIndex: -1,
        },
      ],
      beforeAll: [],
      afterAll: [],
    }
    console.log(`submitting workflow tx`)
    const tx = await userWorkflowRunner.executeWorkflow(workflow, {value : testAmount, gasLimit: 3000000})
    console.log(`submited workflow submit tx: ${JSON.stringify(tx)}`)
    const txr = await tx.wait()
    console.log(`workflow used gas: ${txr.gasUsed}`)
    const stEthAfter = await stEth.balanceOf(otherUser)
    console.log(`stEthBefore ${stEthBefore} stEthAfter ${stEthAfter}`)
    expect(stEthAfter.sub(stEthBefore).gte(minStEthToReceive))
  })
 

})
