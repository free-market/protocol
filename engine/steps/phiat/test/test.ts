import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { PhiatSupplyAction } from '../typechain-types'
import { PhiatSupplyHelper, STEP_TYPE_ID_PHIAT_SUPPLY } from '../tslib/helper'
import { EncodingContext } from '@freemarket/core'
import { getTestFixture, MockWorkflowInstance, validateAction, getUsdt } from '@freemarket/step-sdk/tslib/testing'
import { PhiatSupply } from '../tslib/model'
const testAmount = 99

const setup = getTestFixture(hardhat, async baseFixture => {
  const {
    users: { otherUser },
    signers: { otherUserSigner },
    contracts: { frontDoor },
  } = baseFixture

  // deploy the contract
  await deployments.fixture('PhiatSupplyAction')

  // get a reference to the deployed contract with otherUser as the signer
  const phiatSupplyAction = <PhiatSupplyAction>await ethers.getContract('PhiatSupplyAction', otherUserSigner)

  // get some USDT
  const { usdt, usdtAddress } = await getUsdt(hardhat, '1000000000000000000', otherUserSigner)

  // transfer to stargateBridgeAction
  await (await usdt.transfer(phiatSupplyAction.address, testAmount)).wait()

  // create a mock WorkflowInstance and register the test token
  const mockWorkflowInstance = new MockWorkflowInstance()
  mockWorkflowInstance.registerErc20('USDT', usdtAddress)

  return { contracts: { phiatSupplyAction }, mockWorkflowInstance, usdt, usdtAddress }
})

describe('PhiatSupply', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, phiatSupplyAction },
      mockWorkflowInstance,
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_PHIAT_SUPPLY, phiatSupplyAction.address)
  })

  it('executes', async () => {
    const {
      users: { otherUser },
      contracts: { phiatSupplyAction },
      mockWorkflowInstance,
      usdt,
    } = await setup()

    const stepConfig: PhiatSupply = {
      type: 'phiat-supply',
      asset: {
        type: 'fungible-token',
        symbol: 'USDT',
      },
      source: 'workflow',
      amount: testAmount,
    }
    const helper = new PhiatSupplyHelper(mockWorkflowInstance)

    const context: EncodingContext<PhiatSupply> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }
    const encoded = await helper.encodeWorkflowStep(context)
    await expect(phiatSupplyAction.execute(encoded.inputAssets, encoded.argData)).to.changeTokenBalance(
      usdt,
      phiatSupplyAction.address,
      testAmount * -1
    )
  })
})
