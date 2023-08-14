import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { AaveSupplyAction, IAaveV3Pool__factory, IERC20__factory } from '../typechain-types'
import { AaveSupplyHelper, STEP_TYPE_ID_AAVE_SUPPLY } from '../tslib/supply-helper'
import { ADDRESS_ZERO, EncodingContext } from '@freemarket/core'
import { getTestFixture, MockWorkflowInstance, validateAction, getUsdt, confirmTx } from '@freemarket/step-sdk/tslib/testing'
import { AaveSupply } from '../tslib/model'
import { WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'

const testAmountUsdt = 9
const testAmountUsdtFull = testAmountUsdt * 10 ** 6
const ONE_ETH = ethers.utils.parseEther('1')

const setup = getTestFixture(hardhat, async baseFixture => {
  const {
    users: { otherUser },
    signers: { otherUserSigner },
    contracts: { frontDoor, userWorkflowRunner },
  } = baseFixture

  // deploy the contract
  await deployments.fixture('AaveSupplyAction')

  // get a reference to the deployed contract with otherUser as the signer
  const aaveSupplyAction = <AaveSupplyAction>await ethers.getContract('AaveSupplyAction', otherUserSigner)

  // get some USDT
  const { usdt, usdtAddress } = await getUsdt(hardhat, '1000000000000000000', otherUserSigner)

  // transfer to the step
  await (await usdt.transfer(aaveSupplyAction.address, testAmountUsdtFull)).wait()

  // create a mock WorkflowInstance and register the test token
  const mockWorkflowInstance = new MockWorkflowInstance()
  mockWorkflowInstance.registerErc20('USDT', usdtAddress, 6)

  return { contracts: { aaveSupplyAction, userWorkflowRunner }, mockWorkflowInstance, usdt, usdtAddress, otherUserSigner }
})

describe('AaveSupply', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, aaveSupplyAction },
      mockWorkflowInstance,
      otherUserSigner,
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_AAVE_SUPPLY, aaveSupplyAction.address)
  })

  it('executes when invoked directly', async () => {
    const {
      users: { otherUser },
      contracts: { aaveSupplyAction },
      mockWorkflowInstance,
      usdt,
    } = await setup()

    const stepConfig: AaveSupply = {
      type: 'aave-supply',
      asset: {
        type: 'fungible-token',
        symbol: 'USDT',
      },
      source: 'workflow',
      amount: testAmountUsdt,
    }
    const helper = new AaveSupplyHelper(mockWorkflowInstance)

    const context: EncodingContext<AaveSupply> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }
    const encoded = await helper.encodeWorkflowStep(context)
    await expect(aaveSupplyAction.execute(encoded.inputAssets, encoded.argData, otherUser)).to.changeTokenBalance(
      usdt,
      aaveSupplyAction.address,
      testAmountUsdtFull * -1
    )
  })

  it('executes when invoked via the front door', async () => {
    const {
      users: { otherUser },
      contracts: { userWorkflowRunner, aaveSupplyAction },
      mockWorkflowInstance,
      otherUserSigner,
    } = await setup()

    const stepConfig: AaveSupply = {
      type: 'aave-supply',
      asset: {
        type: 'fungible-token',
        symbol: 'USDT',
      },
      source: 'caller',
      amount: testAmountUsdt,
    }
    const helper = new AaveSupplyHelper(mockWorkflowInstance)

    const context: EncodingContext<AaveSupply> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }
    const encoded = await helper.encodeWorkflowStep(context)
    const supplyWorkflow: WorkflowStruct = {
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

    console.log('getting usdt')
    // get some USDT
    const { usdt } = await getUsdt(hardhat, ONE_ETH, otherUserSigner)
    console.log('got usdt')

    // transfer to the step
    await confirmTx(usdt.approve(userWorkflowRunner.address, testAmountUsdtFull))

    // console.log('estimating gas')
    // const gasEstimate = await userWorkflowRunner.estimateGas.executeWorkflow(workflow)
    // console.log('gasEstimate', gasEstimate.toString())
    const poolAddr = await aaveSupplyAction.poolAddress()
    const pool = IAaveV3Pool__factory.connect(poolAddr, otherUserSigner)
    const reserveData = await pool.getReserveData(usdt.address)
    // console.log('reserveData', reserveData)
    const aTokenAddress = reserveData.aTokenAddress
    const aToken = IERC20__factory.connect(aTokenAddress, otherUserSigner)
    const aTokenBalanceBefore = await aToken.balanceOf(otherUser)
    const usdtBalanceBefore = await usdt.balanceOf(otherUser)
    console.log('usdtBalanceBefore', usdtBalanceBefore.toString())
    console.log('aTokenBalanceBefore', aTokenBalanceBefore.toString())
    console.log('executing workflow', userWorkflowRunner.address)
    await confirmTx(userWorkflowRunner.executeWorkflow(supplyWorkflow, { gasLimit: 3000000 }))
    // await confirmTx(userWorkflowRunner.executeWorkflow())
    const aTokenBalanceAfter = await aToken.balanceOf(otherUser)
    const usdtBalanceAfter = await usdt.balanceOf(otherUser)
    console.log('aTokenBalanceAfter', aTokenBalanceAfter.toString())
    console.log('usdtBalanceAfter', usdtBalanceAfter.toString())

    // await expect(userWorkflow.executeStep(otherUser, encoded.inputAssets, encoded.argData)).to.changeTokenBalance(
    //   usdt,
    //   aaveSupplyAction.address,
    //   testAmountUsdtFull * -1
    // )
  })
})
