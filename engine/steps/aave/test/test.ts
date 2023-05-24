import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { AaveSupplyAction } from '../typechain-types'
import { AaveSupplyHelper, STEP_TYPE_ID } from '../tslib/helper'
import { EncodingContext } from '@freemarket/core'
import { getTestFixture, MockWorkflowInstance, validateAction, getUsdt } from '@freemarket/step-sdk/tslib/testing'
import { AaveSupply } from '../tslib/model'
const testAmount = 99

const setup = getTestFixture(hardhat, async baseFixture => {
  const {
    users: { otherUser },
    signers: { otherUserSigner },
    contracts: { frontDoor },
  } = baseFixture

  // deploy the contract
  await deployments.fixture('AaveSupplyAction')

  // get a reference to the deployed contract with otherUser as the signer
  const aaveSupplyAction = <AaveSupplyAction>await ethers.getContract('AaveSupplyAction', otherUserSigner)

  // get some USDT
  const { usdt, usdtAddress } = await getUsdt(hardhat, '1000000000000000000', otherUserSigner)

  // transfer to stargateBridgeAction
  await (await usdt.transfer(aaveSupplyAction.address, testAmount)).wait()

  // create a mock WorkflowInstance and register the test token
  const mockWorkflowInstance = new MockWorkflowInstance()
  mockWorkflowInstance.registerErc20('USDT', usdtAddress)

  return { contracts: { aaveSupplyAction }, mockWorkflowInstance, usdt, usdtAddress }
})

describe('AaveSupply', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, aaveSupplyAction },
      mockWorkflowInstance,
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID, aaveSupplyAction.address)
  })

  it('executes', async () => {
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
      amount: testAmount,
    }
    const helper = new AaveSupplyHelper(mockWorkflowInstance)

    const context: EncodingContext<AaveSupply> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }
    const encoded = await helper.encodeWorkflowStep(context)
    await expect(aaveSupplyAction.execute(encoded.inputAssets, encoded.argData)).to.changeTokenBalance(
      usdt,
      aaveSupplyAction.address,
      testAmount * -1
    )
  })
})
