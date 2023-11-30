import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { AaveWithdrawAction, IAaveV3Pool__factory, IERC20, IERC20__factory } from '../typechain-types'
import { AaveWithdrawHelper, STEP_TYPE_ID_AAVE_WITHDRAW } from '../tslib/withdraw-helper'
import { ADDRESS_ZERO, EncodingContext } from '@freemarket/core'
import { getTestFixture, MockWorkflowInstance, validateAction, getUsdt, confirmTx } from '@freemarket/step-sdk/tslib/testing'
import { AaveWithdraw } from '../tslib/model'
import { WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'
import { getPoolAddress } from '../tslib/getPoolAddress'
import assert from 'assert'
import { Signer } from '@ethersproject/abstract-signer'

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
  await deployments.fixture('AaveWithdrawAction')

  // get a reference to the deployed contract with otherUser as the signer
  const aaveWithdrawAction = <AaveWithdrawAction>await ethers.getContract('AaveWithdrawAction', otherUserSigner)

  const { usdt, usdtAddress } = await getUsdt(hardhat, '1000000000000000000', otherUserSigner)

  // create a mock WorkflowInstance and register the test token
  const mockWorkflowInstance = new MockWorkflowInstance()
  mockWorkflowInstance.registerErc20('USDT', usdtAddress, 6)

  return { contracts: { aaveWithdrawAction, userWorkflowRunner, usdt }, otherUserSigner, mockWorkflowInstance, usdtAddress }
})

async function deposit(otherUserSigner: Signer, usdt: IERC20) {
  assert(hardhat.network.config.chainId)
  const poolAddress = getPoolAddress(hardhat.network.config.chainId.toString())
  assert(poolAddress)
  const aavePool = IAaveV3Pool__factory.connect(poolAddress, otherUserSigner)

  const otherUserAddress = await otherUserSigner.getAddress()
  // const usdtBalance = await usdt.balanceOf(otherUserSigner.getAddress())
  // console.log('usdt balance', usdtBalance.toString())
  await (await usdt.approve(aavePool.address, testAmountUsdtFull)).wait()
  console.log('supplying', testAmountUsdtFull)
  await (await aavePool.supply(usdt.address, testAmountUsdtFull, otherUserAddress, 0)).wait()
  const rd = await aavePool.getReserveData(usdt.address)
  const aToken = IERC20__factory.connect(rd.aTokenAddress, otherUserSigner)
  const aTokenBalance = await aToken.balanceOf(otherUserAddress)
  console.log('atoken balance:', aTokenBalance.toString())
  await (await aToken.approve(poolAddress, aTokenBalance)).wait()
  return { aavePool, aToken, aTokenBalance }
}

describe('AaveWithdraw', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, aaveWithdrawAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_AAVE_WITHDRAW, aaveWithdrawAction.address)
  })
  it.only('withdraws when there is no debt', async () => {
    const {
      users: { otherUser },
      otherUserSigner,
      contracts: { aaveWithdrawAction, usdt },
    } = await setup()

    const { aToken } = await deposit(otherUserSigner, usdt)

    await (await aToken.approve(aaveWithdrawAction.address, testAmountUsdtFull)).wait()

    // create the SDK data structure
    const stepConfig: AaveWithdraw = {
      type: 'aave-withdraw',
      asset: {
        type: 'fungible-token',
        symbol: 'USDT',
      },
      amount: testAmountUsdt,
    }

    const mockWorkflowInstance = new MockWorkflowInstance()
    mockWorkflowInstance.registerErc20('USDT', usdt.address, 6)
    const helper = new AaveWithdrawHelper(mockWorkflowInstance)

    const context: EncodingContext<AaveWithdraw> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }
    const encoded = await helper.encodeWorkflowStep(context)

    // await (await aToken.transfer(aaveWithdrawAction.address, testAmountUsdtFull)).wait()

    await expect(
      aaveWithdrawAction.execute(encoded.inputAssets, encoded.argData, otherUser, { gasLimit: 30_000_000 })
    ).to.changeTokenBalance(usdt, aaveWithdrawAction.address, testAmountUsdtFull)
  })
})
