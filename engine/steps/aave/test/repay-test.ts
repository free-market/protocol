import { expect } from 'chai'
import hardhat, { ethers } from 'hardhat'
import {
  AaveRepayAction,
  IERC20__factory,
  IPoolAddressesProvider__factory,
  IPool__factory,
  VariableDebtToken__factory,
} from '../typechain-types'
import { EncodingContext } from '@freemarket/core'
import { getTestFixture, MockWorkflowInstance, validateAction, confirmTx, getUsdc } from '@freemarket/step-sdk/tslib/testing'
import { AaveRepay } from '../tslib/model'
import { Eip1193Bridge } from '@ethersproject/experimental'
import { AaveRepayHelper, STEP_TYPE_ID_AAVE_REPAY } from '../tslib/repay-helper'
import { getPoolAddressProviderAddress } from '../tslib/getPoolAddressProviderAddress'
const testAmountUsdc = 5000
const testAmountUsdcFull = testAmountUsdc * 10 ** 6
const ONE_ETH = ethers.utils.parseEther('1')
export const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const setup = getTestFixture(hardhat, async baseFixture => {
  const {
    users: { otherUser },
    signers: { otherUserSigner },
    contracts: { frontDoor, userWorkflowRunner },
  } = baseFixture

  // get a reference to the deployed contract with otherUser as the signer
  const aaveRepayAction = <AaveRepayAction>await ethers.getContract('AaveRepayAction', otherUserSigner)

  // get some USDC
  const { usdc, usdcAddress } = await getUsdc(hardhat, '10000000000000000000', otherUserSigner)

  // create a mock WorkflowInstance
  const mockWorkflowInstance = new MockWorkflowInstance()
  // mockWorkflowInstance.registerErc20('USDC', usdcAddress, 6)
  mockWorkflowInstance.setProvider('ethereum', new Eip1193Bridge(otherUserSigner, otherUserSigner.provider))

  const chainId = await hardhat.getChainId()
  const poolAddressesProvider = IPoolAddressesProvider__factory.connect(getPoolAddressProviderAddress(chainId), otherUserSigner)
  const poolAddress = await poolAddressesProvider.getPool()
  const pool = IPool__factory.connect(poolAddress, otherUserSigner)

  // deposit some USDC into aave
  confirmTx(usdc.approve(poolAddress, testAmountUsdcFull))
  console.log('depositing usdc', testAmountUsdcFull.toString())
  await confirmTx(usdc.approve(poolAddress, testAmountUsdcFull))
  await confirmTx(pool.supply(usdc.address, testAmountUsdcFull, otherUser, 0))

  // fetch borrowing power
  const userAccount = await pool.getUserAccountData(otherUser)
  const borrowingPower = userAccount.availableBorrowsBase
  console.log('borrowing power', borrowingPower.toString())

  return {
    contracts: { aaveRepayAction, userWorkflowRunner, pool },
    mockWorkflowInstance,
    usdc,
    usdcAddress,
    otherUserSigner,
    hardhat,
  }
})

describe('AaveRepay', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, aaveRepayAction },
      mockWorkflowInstance,
      otherUserSigner,
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_AAVE_REPAY, aaveRepayAction.address)
  })

  it('executes when invoked directly', async () => {
    const {
      users: { otherUser },
      contracts: { aaveRepayAction, pool },
      mockWorkflowInstance,
      usdc,
      otherUserSigner,
      hardhat,
    } = await setup()

    const wbtcAddr = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'

    const wbtc = IERC20__factory.connect(wbtcAddr, otherUserSigner)

    console.log('borrowing 0.01 wbtc')
    confirmTx(pool.borrow(wbtcAddr, '1000000', 2, 0, otherUser))

    // look at the debt token for WETH and verify that it has a balance
    const reserveData = await pool.getReserveData(wbtcAddr)
    const debtToken = VariableDebtToken__factory.connect(reserveData.variableDebtTokenAddress, otherUserSigner)
    const debtBefore = await debtToken.balanceOf(otherUser)
    console.log('wbtc debtToken balance', debtBefore.toString())

    const repayStepConfig: AaveRepay = {
      type: 'aave-repay',
      asset: {
        type: 'fungible-token',
        symbol: 'WBTC',
      },
      source: 'workflow',
      amount: '.01',
      interestRateMode: 'variable',
    }
    const repayHelper = new AaveRepayHelper(mockWorkflowInstance)
    const repayEncodingContext: EncodingContext<AaveRepay> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig: repayStepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }
    const supplyEncoded = await repayHelper.encodeWorkflowStep(repayEncodingContext)
    await confirmTx(wbtc.transfer(aaveRepayAction.address, '1000000'))
    const repayTx = await (await aaveRepayAction.execute(supplyEncoded.inputAssets, supplyEncoded.argData, otherUser)).wait()
    const debtAfter = await debtToken.balanceOf(otherUser)
    console.log('debtAfter', debtAfter.toString())
    expect(debtAfter).to.be.lessThan(debtBefore)
  })
  it('repays using native', async () => {
    const {
      users: { otherUser },
      contracts: { aaveRepayAction, pool },
      mockWorkflowInstance,
      usdc,
      otherUserSigner,
      hardhat,
    } = await setup()

    const weth = IERC20__factory.connect(WETH_ADDRESS, otherUserSigner)

    console.log('borrowing 0.1 WETH')
    const pointOneEth = ethers.utils.parseEther('0.1')
    confirmTx(pool.borrow(WETH_ADDRESS, pointOneEth, 2, 0, otherUser))

    // look at the debt token for WETH and verify that it has a balance
    const reserveData = await pool.getReserveData(WETH_ADDRESS)
    const debtToken = VariableDebtToken__factory.connect(reserveData.variableDebtTokenAddress, otherUserSigner)
    const debtBefore = await debtToken.balanceOf(otherUser)
    console.log('WETH debtToken balance', debtBefore.toString())

    const repayStepConfig: AaveRepay = {
      type: 'aave-repay',
      asset: {
        type: 'native',
      },
      source: 'workflow',
      amount: '0.1',
      interestRateMode: 'variable',
    }
    const repayHelper = new AaveRepayHelper(mockWorkflowInstance)
    const repayEncodingContext: EncodingContext<AaveRepay> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig: repayStepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }
    const supplyEncoded = await repayHelper.encodeWorkflowStep(repayEncodingContext)
    const repayTx = await (
      await aaveRepayAction.execute(supplyEncoded.inputAssets, supplyEncoded.argData, otherUser, { value: pointOneEth })
    ).wait()
    const debtAfter = await debtToken.balanceOf(otherUser)
    console.log('debtAfter', debtAfter.toString())
    expect(debtAfter).to.be.lessThan(debtBefore)
  })
})
