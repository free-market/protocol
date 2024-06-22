/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai'
import hre, { ethers, deployments } from 'hardhat'
import { MAINNET_EZETH_ADDRESS, STEP_TYPE_ID_RENZO_ETH_TO_EZETH } from '../tslib'
import { ADDRESS_ZERO, ASSET_TYPE_NATIVE, AssetReference, createStandardProvider, EncodingContext, IERC20__factory, TEN_BIG } from '@freemarket/core'
import { confirmTx, getTestFixture, getUsdt, MockWorkflowInstance, validateAction, WETH_ADDRESS } from '@freemarket/step-sdk/tslib/testing'
import { Weth__factory, formatNumber } from '@freemarket/step-sdk'
import { UniswapExactIn, encodeDepositEthForEzEthParams } from '../tslib/model'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'
import { DepositEthForEZEthAction } from '../typechain-types'

import Big from 'big.js'
import { Signer } from '@ethersproject/abstract-signer'
import { IERC20Metadata__factory } from '@freemarket/runner'
import { Provider } from '@ethersproject/providers'
import { AbiCoder } from 'ethers/lib/utils'

const testAmountEth = new Big('1')
const testAmountWei = testAmountEth.mul(TEN_BIG.pow(18)).toFixed(0)

const ONE_ETH = ethers.utils.parseEther('1')


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
  /*
  const fromAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: 'WETH',
  }
  const toAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: toSymbol,
  }
  */

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
    // should fail requesting testAmount since ezEth amout will be less
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
