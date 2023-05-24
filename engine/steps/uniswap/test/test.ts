/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { STEP_TYPE_ID, UniswapExactInHelper } from '../tslib/helper'
import { AssetReference, createStandardProvider, EncodingContext, IERC20__factory } from '@freemarket/core'
import { getTestFixture, MockWorkflowInstance, validateAction, WETH_ADDRESS } from '@freemarket/step-sdk/tslib/testing'
import { Weth__factory } from '@freemarket/step-sdk'
import { UniswapExactIn } from '../tslib/model'
import { UniswapExactInAction } from '../typechain-types'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { ADDRESS_ZERO } from '@uniswap/v3-sdk'

//                   12345678901234567890
const testAmount = '10000000000000000000'
const UsdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const WethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const WbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
const AmpAddress = '0xfF20817765cB7f73d4bde2e66e067E58D11095C2'

const toSymbol = 'AMP'
const toAddress = AmpAddress

const fromAmount = '100000000000000000000'

const setup = getTestFixture(hardhat, async baseFixture => {
  const {
    signers: { otherUserSigner },
  } = baseFixture

  const weth = Weth__factory.connect(WETH_ADDRESS, otherUserSigner)

  // deploy the contract
  await deployments.fixture('CurveTriCrypto2SwapAction')

  // get a reference to the deployed contract with otherUser as the signer
  const uniswapExactInAction = <UniswapExactInAction>await ethers.getContract('UniswapExactInAction', otherUserSigner)
  const toToken = IERC20__factory.connect(toAddress, otherUserSigner)
  const mockWorkflowInstance = new MockWorkflowInstance()
  const stdProvider = createStandardProvider(otherUserSigner.provider!, otherUserSigner)
  const helper = new UniswapExactInHelper(mockWorkflowInstance, stdProvider)
  const fromAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: 'WETH',
  }
  const toAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: toSymbol,
  }

  return { contracts: { uniswapExactInAction, toToken, weth }, mockWorkflowInstance, helper, fromAssetRef, toAssetRef }
})

describe('Uniswap Exact In', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, uniswapExactInAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID, uniswapExactInAction.address)
  })

  it('computes exchange rates with slippage', () => {
    // const { helper } = await setup()
    const fromAmount = '1000'
    const token = new Token(1, ADDRESS_ZERO, 18)
    const toAmount = CurrencyAmount.fromRawAmount(token, 500)
    const slippageTolerance = 1 // 1%
    const worstAllowableSlippage = UniswapExactInHelper.getMinExchangeRate(fromAmount, toAmount, slippageTolerance)
    expect(worstAllowableSlippage).to.eq('0x007eb851eb851eb851eb851eb851eb851f')
  })

  it('computes a route', async () => {
    const { helper, fromAssetRef, toAssetRef } = await setup()
    // await getWeth(fromAmount, otherUserSigner)
    const route = await helper.getRoute(fromAssetRef, toAssetRef, fromAmount)
    expect(route).to.not.be.undefined
  })

  // it('encodes a route', async () => {
  //   const {
  //     helper,
  //     users: { otherUser },
  //     signers: { otherUserSigner },
  //     fromAssetRef,
  //     toAssetRef,
  //     contracts: { toToken },
  //   } = await setup()
  //   await getWeth(fromAmount, otherUserSigner)
  //   const route = await helper.getRoute(fromAssetRef, toAssetRef, fromAmount)
  //   expect(route).to.not.be.undefined
  //   const encodedPaths = UniswapExactInHelper.encodeRoute(route!)
  //   const chainId = (await otherUserSigner.provider!.getNetwork()).chainId
  //   // console.log('approving', fromAmount, chainId)
  //   const weth = Weth__factory.connect(WETH_ADDRESS, otherUserSigner)
  //   await (await weth.approve(SWAP_ROUTER_ADDRESS, fromAmount)).wait()
  //   const allowance = await weth.allowance(otherUser, SWAP_ROUTER_ADDRESS)
  //   // console.log('allowance', allowance.toString())
  //   const fromBalance = await weth.balanceOf(otherUser)
  //   // console.log('fromBalance', fromBalance.toString())

  //   const toBalanceBefore = await toToken.balanceOf(otherUser)

  //   const swapRouter: SwapRouter02 = SwapRouter02__factory.connect(SWAP_ROUTER_ADDRESS, otherUserSigner)

  //   // based on code examples from uniswap deadline is unix timestamp in seconds
  //   const deadline = Math.floor(Date.now() / 1000 + 1800)
  //   const promises: Promise<any>[] = []
  //   // console.log(`encodedPaths.length=${encodedPaths.length} encodedPaths=${JSON.stringify(encodedPaths, null, 2)}`)
  //   let pathBalanceBefore = toBalanceBefore
  //   for (const path of encodedPaths) {
  //     const amountIn = Math.floor(parseInt(testAmount) * parseFloat(path.portion))
  //     const args: IV3SwapRouter.ExactInputParamsStruct = {
  //       path: path.encodedPath,
  //       recipient: otherUser,
  //       // deadline,
  //       amountIn: path.portion,
  //       amountOutMinimum: 0,
  //     }
  //     console.log(`submitting path=${path.encodedPath} amountIn=${path.amount}`)
  //     const response = await swapRouter.exactInput(args)
  //     console.log('submit waiting')
  //     const receipt = await response.wait()
  //     const pathBalanceAfter = await toToken.balanceOf(otherUser)
  //     const pathBalanceDiff = pathBalanceAfter.sub(pathBalanceBefore)
  //     console.log(`pathBalanceDiff=${pathBalanceDiff.toString()}`)
  //     pathBalanceBefore = pathBalanceAfter
  //     // console.log(receipt)
  //   }

  //   const toBalanceAfter = await toToken.balanceOf(otherUser)
  //   console.log('toBalanceAfter', toBalanceAfter.toString())
  //   const toBalanceDiff = toBalanceAfter.sub(toBalanceBefore)
  //   console.log('toBalanceDiff', toBalanceDiff.toString())
  //   expect(toBalanceDiff).to.be.gt(0)
  // })

  it('does a transfer using the helper and the integration contract', async () => {
    const {
      users: { otherUser },
      contracts: { uniswapExactInAction, toToken, weth },
      helper,
    } = await setup()

    // wrap eth and give it to the Action
    await (await weth.deposit({ value: testAmount })).wait()
    weth.transfer(uniswapExactInAction.address, testAmount)

    const stepConfig: UniswapExactIn = {
      type: 'uniswap-exact-in',
      inputAsset: {
        type: 'fungible-token',
        symbol: 'WETH',
      },
      inputAssetSource: 'caller',
      inputAmount: testAmount,
      outputAsset: {
        type: 'fungible-token',
        symbol: toSymbol,
      },
    }

    const context: EncodingContext<UniswapExactIn> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }

    const encoded = await helper.encodeWorkflowStep(context)

    const toBalanceBefore = await toToken.balanceOf(uniswapExactInAction.address)
    const { inputAssets, argData } = encoded
    await (await uniswapExactInAction.execute(inputAssets, argData)).wait()
    // console.log('uniswapExactInAction.address', uniswapExactInAction.address)
    // console.log('toToken.address', toToken.address)
    const toBalanceAfter = await toToken.balanceOf(uniswapExactInAction.address)
    // console.log('toBalanceAfter', toBalanceAfter.toString())
    expect(toBalanceAfter).to.be.greaterThan(toBalanceBefore)
  })
})
