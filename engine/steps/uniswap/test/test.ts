import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { STEP_TYPE_ID, UniswapExactInHelper } from '../tslib/helper'
import { createStandardProvider, EncodingContext, IERC20__factory, WORKFLOW_END_STEP_ID } from '@freemarket/core'
import { getTestFixture, getUsdt, MockWorkflowInstance, validateAction, WETH_ADDRESS } from '@freemarket/step-sdk/tslib/testing'
import { TestErc20__factory, Weth__factory } from '@freemarket/step-sdk'
import { IERC20 } from '@freemarket/runner'
import { BigNumber } from 'ethers'
import { UniswapExactIn } from '../tslib/model'
import { UniswapExactInAction } from '../typechain-types'
const testAmount = '1000000000000000000'

const UsdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const WethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const WbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'

const setup = getTestFixture(hardhat, async baseFixture => {
  const {
    users: { otherUser },
    signers: { otherUserSigner },
    contracts: { frontDoor },
  } = baseFixture

  const weth = Weth__factory.connect(WETH_ADDRESS, otherUserSigner)

  // deploy the contract
  await deployments.fixture('CurveTriCrypto2SwapAction')

  // get a reference to the deployed contract with otherUser as the signer
  const uniswapExactInAction = <UniswapExactInAction>await ethers.getContract('UniswapExactInAction', otherUserSigner)
  const usdt = IERC20__factory.connect(UsdtAddress, otherUserSigner)
  const mockWorkflowInstance = new MockWorkflowInstance()
  mockWorkflowInstance.registerErc20('USDT', UsdtAddress)
  mockWorkflowInstance.registerErc20('WETH', WethAddress)
  mockWorkflowInstance.registerErc20('WBTC', WbtcAddress)

  const helper = new UniswapExactInHelper(mockWorkflowInstance)

  return { contracts: { uniswapExactInAction, usdt, weth }, mockWorkflowInstance, helper }
})

describe('Uniswap Exact In', async () => {
  it('deploys', async () => {
    const {
      contracts: { userWorkflowRunner, uniswapExactInAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(userWorkflowRunner, STEP_TYPE_ID, uniswapExactInAction.address)
  })

  it('transfers WETH to USDT', async () => {
    const {
      users: { otherUser },
      contracts: { uniswapExactInAction, usdt, weth },
      helper,
    } = await setup()

    // wrap eth and give it to the Action
    await (await weth.deposit({ value: testAmount })).wait()
    weth.transfer(uniswapExactInAction.address, testAmount)

    const stepConfig: UniswapExactIn = {
      type: 'uniswap-exact-in',
      inputSymbol: 'WETH',
      inputAmount: testAmount,
      outputSymbol: 'USDT',
    }

    const context: EncodingContext<UniswapExactIn> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
    }
    let encoded = await helper.encodeWorkflowStep(context)

    const tetherBalanceBefore = await usdt.balanceOf(uniswapExactInAction.address)
    let { inputAssets, outputAssets, data } = encoded
    await (await uniswapExactInAction.execute(inputAssets, outputAssets, data)).wait()
    let tetherBalanceAfter = await usdt.balanceOf(uniswapExactInAction.address)
    expect(tetherBalanceAfter).to.be.greaterThan(tetherBalanceBefore)

    // // go the other direction: USDT -> WETH
    // context.stepConfig = {
    //   type: 'uniswap-exact-in',
    //   inputSymbol: 'USDT',
    //   outputSymbol: 'WETH',
    //   inputAmount: testAmount,
    // }
    // encoded = await helper.encodeWorkflowStep(context)
    // // await expect(triCryptoAction.execute(encoded.inputAssets, encoded.outputAssets, encoded.data)).not.to.be.reverted
    // await (await triCryptoAction.execute(encoded.inputAssets, encoded.outputAssets, encoded.data)).wait()
    // tetherBalanceAfter = await usdt.balanceOf(triCryptoAction.address)
    // expect(tetherBalanceAfter).to.equal(0)
  })
})
